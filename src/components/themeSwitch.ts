import { inkSplat, rasterSplat, splatKeyframes, type Point, type Splat } from './inkSplat';
import { applyTheme, currentTheme, type Theme } from './theme';

export type { Point };

/**
 * Theme switch with an ink bleed.
 *
 * The browser's View Transitions API snapshots the whole screen before and after the
 * switch, so every pixel (sticky header, background grid, screenshots) changes together
 * and exactly as it will look. The new theme is revealed through an ink splat that
 * grows from where the toggle was pressed until it covers the viewport.
 *
 * Without View Transitions (or pseudo-element animation) the colours cross-fade; with
 * reduced motion the switch is instant.
 */

const DURATION_MS = 900;
/** Longest the switch waits for screenshots in view to decode in their new theme. */
const IMAGE_WAIT_MS = 120;
const CSS_FADE_S = 0.45;

export const otherTheme = (theme: Theme): Theme => (theme === 'dark' ? 'light' : 'dark');

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

let fadeTimer = 0;

/** Colour cross-fade for browsers without View Transitions. */
export function crossFade(to: Theme): void {
  const root = document.documentElement;
  root.classList.add('theme-fade');
  root.style.setProperty('--theme-fade', `${CSS_FADE_S}s`);
  applyTheme(to, true);
  window.clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove('theme-fade'), CSS_FADE_S * 1000 + 50);
}

/**
 * Applies the theme with every CSS transition off, so the "after" snapshot shows final
 * colours rather than the first frame of a colour transition.
 */
function switchInstantly(theme: Theme): void {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  applyTheme(theme, true);
  void root.offsetWidth; // flush styles while transitions are off
  root.classList.remove('theme-switching');
}

/** Waits (briefly) until images in view have decoded their new theme's file. */
async function imagesInView(): Promise<void> {
  const visible = Array.from(document.images).filter((img) => {
    const r = img.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  });
  const decoded = Promise.all(visible.map((img) => img.decode().catch(() => undefined)));
  await Promise.race([decoded, new Promise((resolve) => window.setTimeout(resolve, IMAGE_WAIT_MS))]);
}

let seed = Math.floor(Math.random() * 2 ** 31);

type Prepared = Splat & { release: () => void };

/**
 * The next pair of splats, rasterised ahead of time while the page is idle, so a press
 * does no drawing at all. A press that arrives before they are ready uses SVG splats.
 */
let prepared: [Prepared, Prepared] | null = null;
let preparing = false;

function prepare(): void {
  if (preparing || prepared || typeof document === 'undefined') return;
  preparing = true;
  Promise.all([rasterSplat(seed++), rasterSplat(seed++)])
    .then((pair) => {
      prepared = pair;
    })
    .catch(() => undefined)
    .finally(() => {
      preparing = false;
    });
}

function whenIdle(task: () => void): void {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) window.requestIdleCallback(task, { timeout: 2000 });
  else setTimeout(task, 600);
}

function takeSplats(): [Prepared, Prepared] {
  const pair = prepared ?? ([inkSplat(seed++), inkSplat(seed++)].map((s) => ({ ...s, release: () => undefined })) as [Prepared, Prepared]);
  prepared = null;
  return pair;
}

/** Warms the splats as soon as the page is idle; call again any time, it is cheap. */
export function prepareInk(): void {
  if (!prepared) whenIdle(prepare);
}

if (typeof window !== 'undefined' && !reducedMotion()) prepareInk();

interface Ink {
  transition: ViewTransition;
  /** The splat animation, once the transition's pseudo-elements exist. */
  animation: Animation | null;
  /** Theme before the press: restored if the ink is pressed back before it lands. */
  from: Theme;
  /** True while the ink is pulling back towards where it was pressed. */
  reversed: boolean;
}

let active: Ink | null = null;

/** Pressed again mid-spread: pull the ink back, then hand the page back to the old theme. */
function reverse(ink: Ink): void {
  ink.reversed = !ink.reversed;
  ink.animation?.reverse();
}

/**
 * Switches theme, bleeding ink from `point` (viewport CSS px) or from the centre of
 * `toggle` (keyboard presses).
 */
export function switchTheme(toggle: HTMLElement, point?: Point): void {
  if (reducedMotion()) {
    applyTheme(otherTheme(currentTheme()), true);
    return;
  }
  // Both are needed: the splat animates the transition's pseudo-element. Without
  // pseudo-element support the mask would land on the live page instead.
  if (
    typeof document.startViewTransition !== 'function' ||
    typeof KeyframeEffect === 'undefined' ||
    !('pseudoElement' in KeyframeEffect.prototype)
  ) {
    crossFade(otherTheme(currentTheme()));
    return;
  }
  if (active) {
    reverse(active);
    return;
  }

  const r = toggle.getBoundingClientRect();
  const origin = point ?? { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  const splats = takeSplats();
  const root = document.documentElement;
  const from = currentTheme();
  const to = otherTheme(from);

  root.classList.add('ink-transition');
  const transition = document.startViewTransition(async () => {
    switchInstantly(to);
    // Let React and the background grid repaint for the new theme before the snapshot.
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await imagesInView();
  });
  const ink: Ink = { transition, animation: null, from, reversed: false };
  active = ink;

  // While the transition is on screen some browsers (Chrome) hit-test every click to
  // <html> instead of the page underneath, so a second press on the toggle would be lost.
  // Catch presses over the toggle there; where the click does reach the button, its own
  // handler reverses the ink and this one ignores it.
  const onPress = (event: MouseEvent) => {
    if (event.target !== root) return;
    const box = toggle.getBoundingClientRect();
    const over =
      event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (over) reverse(ink);
  };
  document.addEventListener('click', onPress, true);

  transition.ready
    .then(() => {
      const animation = root.animate(splatKeyframes([splats[0], splats[1]], origin, window.innerWidth, window.innerHeight), {
        duration: DURATION_MS,
        easing: 'linear', // the spread curve is baked into the keyframes
        fill: 'both',
        pseudoElement: '::view-transition-new(root)',
      });
      // Pulled all the way back: the old snapshot is showing in full, so switching the
      // live page back now ends the transition without a visible change.
      animation.onfinish = () => {
        if (ink.reversed) switchInstantly(ink.from);
      };
      ink.animation = animation;
      if (ink.reversed) animation.reverse();
    })
    .catch(() => {
      // No animation could run: make sure the page ends where the presses asked.
      if (ink.reversed) switchInstantly(ink.from);
    });

  transition.updateCallbackDone.catch(() => undefined);
  transition.finished
    .catch(() => undefined)
    .finally(() => {
      document.removeEventListener('click', onPress, true);
      if (active === ink) active = null;
      root.classList.remove('ink-transition');
      splats.forEach((s) => s.release());
      prepareInk();
    });
}
