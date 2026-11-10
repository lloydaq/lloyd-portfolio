import { applyTheme, currentTheme, type Theme } from './theme';

export interface Point {
  x: number;
  y: number;
}

export const otherTheme = (theme: Theme): Theme => (theme === 'dark' ? 'light' : 'dark');

const CSS_FADE_S = 0.45;
let fadeTimer = 0;

/**
 * Plain colour cross-fade: used without WebGL2, with reduced motion, or when a snapshot
 * can't be taken. `theme-fade` only exists for the length of the switch.
 */
export function crossFade(to: Theme): void {
  const root = document.documentElement;
  root.classList.add('theme-fade');
  root.style.setProperty('--theme-fade', `${CSS_FADE_S}s`);
  applyTheme(to, true);
  window.clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove('theme-fade'), CSS_FADE_S * 1000 + 50);
}

type InkModule = typeof import('../ink/inkTransition');
let ink: Promise<InkModule> | null = null;

function inkPossible(): boolean {
  if (typeof window === 'undefined' || typeof WebGL2RenderingContext === 'undefined') return false;
  return !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
}

function loadInk(): Promise<InkModule> {
  ink ??= import('../ink/inkTransition');
  return ink;
}

/** Fetches the ink code ahead of the click (pointer over or focus on the toggle). */
export function prepareThemeSwitch(): void {
  if (inkPossible()) loadInk().catch(() => (ink = null));
}

/**
 * Switches theme with the ink bleed, spreading from `point` (viewport CSS px) or from the
 * toggle itself (keyboard). Falls back to the cross-fade when the ink can't run.
 */
export function switchTheme(toggle: HTMLButtonElement, point?: Point): void {
  if (!inkPossible()) {
    crossFade(otherTheme(currentTheme()));
    return;
  }
  loadInk().then(
    (m) => m.inkToggle(toggle, point),
    () => {
      ink = null;
      crossFade(otherTheme(currentTheme()));
    },
  );
}
