import gsap from 'gsap';
import { applyTheme, currentTheme, type Theme } from '../components/theme';
import { crossFade, otherTheme, type Point } from '../components/themeSwitch';
import { captureViewport, renderScale, type Snapshot } from './capture';
import { inkParams } from './params';
import { InkRenderer, type InkFrame, type InkSource } from './renderer';

/*
 * Ink-bleed theme transition, adapted from ink-bleed-theme-changer
 * (https://github.com/codemure-official/ink-bleed-theme-changer). The shader, spread
 * timing, interrupt handling and toggle colour hand-over follow that project; capture and
 * compositing are reworked for this site (see capture.ts and shaders.ts).
 */

const EASE = 'power3.out';
const FADE_OUT = 0.15;

/**
 * Spread shape over time. `growth`: base radius at progress 1 relative to the farthest
 * corner. `cleanupFrom`: fraction of the (linear) duration after which a uniform extra
 * reach slowly eats whatever the noise left behind, so the page is fully covered exactly
 * at the end. `cleanupReach`: that extra reach at t = 1, relative to the farthest corner.
 */
export const SPREAD = { growth: 0.7, cleanupFrom: 0.45, cleanupReach: 0.4, cleanupPow: 2 };

const reducedMotion = (): boolean => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

interface ChromeColors {
  backgroundColor: string;
  borderColor: string;
  color: string;
}

type ActiveFrame = Omit<InkFrame, 'progress' | 'radius' | 'time' | 'cleanup'>;

/**
 * Orchestrates the theme transition:
 *  1. on toggle, snapshots the visible page in the current theme
 *  2. covers the page with that snapshot, switches the live page underneath, then spreads
 *     the ink: inked areas of the overlay turn transparent and reveal the real page
 *  3. if toggled mid-spread, freezes the frame on screen and spreads the next ink over it
 *  4. falls back to a CSS colour cross-fade without WebGL2, with reduced motion, or if the
 *     snapshot fails
 */
class InkTransition {
  private readonly renderer: InkRenderer | null;
  private readonly state = { progress: 0, time: 0 };
  private tween: gsap.core.Tween | null = null;
  private fade: gsap.core.Tween | null = null;
  private frame: ActiveFrame | null = null;
  private chrome: gsap.core.Tween | null = null;
  private chromeButton: HTMLElement | null = null;
  private capturing = false;
  private layoutWidth = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = InkRenderer.create(canvas);
    if (!this.renderer) return;
    this.renderer.resize(renderScale());
    this.renderer.watchContext(() => this.cancel());

    window.addEventListener('resize', () => {
      if (!this.frame) return;
      // A width change reflows the page, so the snapshot no longer lines up with it.
      if (document.documentElement.clientWidth !== this.layoutWidth) {
        this.cancel();
        return;
      }
      this.renderer?.resize(renderScale());
      this.draw();
    });
  }

  /** Toggle the theme, spreading from `point` (viewport CSS px) or from the toggle. */
  async toggle(button: HTMLButtonElement, point?: Point): Promise<void> {
    // The snapshot takes a moment; a second press in that window would race it.
    if (this.capturing) return;
    const renderer = this.renderer;
    if (!renderer || renderer.isLost || reducedMotion()) {
      this.fallback();
      return;
    }

    const theme = currentTheme();
    let snapshot: Snapshot | null = null;
    this.capturing = true;
    try {
      snapshot = await captureViewport(renderer.maxTextureSize);
    } catch (err) {
      console.error('[ink] capture failed', err);
    } finally {
      this.capturing = false;
    }
    // Something else switched the theme meanwhile, or the GPU went away: just switch.
    if (!snapshot || renderer.isLost || reducedMotion() || currentTheme() !== theme) {
      this.fallback();
      return;
    }
    this.start(renderer, snapshot, button, point);
  }

  private fallback(): void {
    this.cancel();
    crossFade(otherTheme(currentTheme()));
  }

  private start(renderer: InkRenderer, snapshot: Snapshot, button: HTMLButtonElement, point?: Point): void {
    const to = otherTheme(currentTheme());
    renderer.resize(renderScale());

    // Interrupted: freeze exactly what is on screen and spread the new ink over it.
    let from: InkSource = 'snapshot';
    if (this.frame) {
      this.tween?.kill();
      this.fade?.kill();
      this.tween = this.fade = null;
      renderer.upload('under', snapshot);
      const frozen = this.currentFrame();
      if (frozen && renderer.freeze(frozen)) from = 'composite';
      else renderer.upload('from', snapshot);
    } else {
      renderer.upload('from', snapshot);
    }

    const r = button.getBoundingClientRect();
    const buttonCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const center = point ?? buttonCenter;
    const maxDist = farthestCorner(center);
    this.frame = {
      from,
      to,
      center,
      maxDist,
      seed: randomSeed(),
      hole: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
    };
    this.state.progress = 0;
    this.state.time = 0;
    this.layoutWidth = document.documentElement.clientWidth;

    const chromeFrom = readChrome(button);
    this.draw();
    // Same task: the overlay (showing the old theme) and the switched page hit the screen together.
    gsap.set(renderer.canvas, { opacity: 1 });
    renderer.canvas.classList.add('is-active');
    switchInstantly(to);

    const duration = inkParams.duration;
    this.holdChrome(button, chromeFrom, this.inkArrival(center, maxDist, buttonCenter) * duration);

    this.tween = gsap.to(this.state, {
      progress: 1,
      duration,
      ease: EASE,
      onUpdate: () => {
        this.state.time = this.tween?.time() ?? 0;
        this.draw();
      },
      onComplete: () => this.finish(),
    });
    this.tween.timeScale(inkParams.timeScale);
  }

  private currentFrame(): InkFrame | null {
    if (!this.frame) return null;
    const { progress, time } = this.state;
    const { maxDist } = this.frame;
    const linear = Math.min(1, time / inkParams.duration);
    const ramp = Math.max(0, (linear - SPREAD.cleanupFrom) / (1 - SPREAD.cleanupFrom));
    // Second term only acts in the last ~3% (≈40ms): a guarantee for unlucky seeds so the
    // final frame is fully inked before the fade.
    const cleanup =
      ramp ** SPREAD.cleanupPow * maxDist * SPREAD.cleanupReach + Math.max(0, (linear - 0.97) / 0.03) * maxDist;
    return { ...this.frame, progress, time, radius: progress * maxDist * SPREAD.growth, cleanup };
  }

  private draw(): void {
    const frame = this.currentFrame();
    if (this.renderer && frame) this.renderer.draw(frame);
  }

  private finish(): void {
    const canvas = this.renderer?.canvas;
    this.tween = null;
    if (!canvas) return;
    this.fade = gsap
      .to(canvas, { opacity: 0, duration: FADE_OUT, ease: 'none', onComplete: () => this.hide() })
      .timeScale(inkParams.timeScale);
  }

  private hide(): void {
    this.fade = null;
    this.frame = null;
    this.renderer?.canvas.classList.remove('is-active');
  }

  private cancel(): void {
    this.releaseChrome();
    if (!this.frame) return;
    this.tween?.kill();
    this.fade?.kill();
    this.tween = null;
    this.hide();
  }

  /**
   * The toggle is drawn live through a hole in the overlay, so it would switch colours
   * before the ink reaches it. Hold its old colours, then hand over as the ink arrives.
   */
  private holdChrome(button: HTMLButtonElement, from: ChromeColors, delay: number): void {
    this.releaseChrome();
    this.chromeButton = button;
    // Plain style write (not gsap.set) so the hold lands in this very frame. No CSS
    // transition while the colours are driven from here.
    Object.assign(button.style, from, { transition: 'none' });
    const duration = inkParams.duration;
    this.chrome = gsap.to(button, {
      backgroundColor: () => targetChrome(button).backgroundColor,
      borderColor: () => targetChrome(button).borderColor,
      color: () => targetChrome(button).color,
      duration: Math.min(0.18, duration * 0.15),
      ease: 'power1.out',
      delay,
      onComplete: () => this.releaseChrome(),
    });
    this.chrome.timeScale(inkParams.timeScale);
  }

  private releaseChrome(): void {
    this.chrome?.kill();
    this.chrome = null;
    if (this.chromeButton) gsap.set(this.chromeButton, { clearProps: 'backgroundColor,borderColor,color,transition' });
    this.chromeButton = null;
  }

  /**
   * Fraction of the duration at which the base ink front reaches `target` (the eased
   * radius inverted; slightly early, since the noise lets the front lead).
   */
  private inkArrival(center: Point, maxDist: number, target: Point): number {
    const dist = Math.hypot(target.x - center.x, target.y - center.y);
    if (dist < 28) return 0;
    const p = Math.min(1, dist / (maxDist * SPREAD.growth * 1.15));
    // Inverse of power3.out, capped: the end-of-spread cleanup sweeps the last corners by ~85%.
    return Math.min(0.85, 1 - Math.cbrt(1 - p));
  }
}

/**
 * Applies the theme with every CSS transition off, so the page under the ink is already
 * in its final colours (the toggle's own icon swap still animates).
 */
function switchInstantly(theme: Theme): void {
  const root = document.documentElement;
  root.classList.add('ink-switching');
  applyTheme(theme, true);
  void root.offsetWidth; // flush styles while transitions are off
  root.classList.remove('ink-switching');
}

function readChrome(el: HTMLElement): ChromeColors {
  const cs = getComputedStyle(el);
  return { backgroundColor: cs.backgroundColor, borderColor: cs.borderTopColor, color: cs.color };
}

/** Stylesheet colours for the current (already switched) theme. */
function targetChrome(el: HTMLElement): ChromeColors {
  const saved = el.getAttribute('style') ?? '';
  el.style.removeProperty('background-color');
  el.style.removeProperty('border-color');
  el.style.removeProperty('color');
  const target = readChrome(el);
  el.setAttribute('style', saved);
  return target;
}

function farthestCorner(p: Point): number {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  return Math.max(Math.hypot(p.x, p.y), Math.hypot(w - p.x, p.y), Math.hypot(p.x, h - p.y), Math.hypot(w - p.x, h - p.y)) + 4;
}

function randomSeed(): InkFrame['seed'] {
  return { x: Math.random() * 64 - 32, y: Math.random() * 64 - 32, angle: Math.random() * Math.PI * 2 };
}

let instance: InkTransition | null = null;

/** Entry point used by the header toggle (loaded on demand). */
export function inkToggle(button: HTMLButtonElement, point?: Point): void {
  if (!instance) {
    const canvas = document.createElement('canvas');
    canvas.className = 'ink-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('data-ink-ignore', '');
    document.body.append(canvas);
    instance = new InkTransition(canvas);
  }
  void instance.toggle(button, point);
}
