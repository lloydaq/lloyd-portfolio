import type { Theme } from '../components/theme';

/** Look of the ink (defaults from ink-bleed-theme-changer). */
export interface InkParams {
  /** Seconds for the spread (before the 150ms fade). */
  duration: number;
  /** Tendril reach multiplier, 0 = clean blob. */
  tendril: number;
  /** Noise frequency multiplier: lower = bigger, lazier shapes. */
  noiseScale: number;
  /** Frontier half-width in CSS px. */
  softness: number;
  /** Speed at which the shape evolves during the spread. */
  drift: number;
  /** Global playback rate (1 = normal speed). */
  timeScale: number;
}

export const inkParams: InkParams = {
  duration: 1.4,
  tendril: 1,
  noiseScale: 1,
  softness: 1.4,
  drift: 1,
  timeScale: 1,
};

/** Pigment colour pooled at the frontier, keyed by the theme being revealed. */
export const RIM_COLOR: Record<Theme, [number, number, number]> = {
  dark: [0.04, 0.04, 0.05], // ink: a touch denser than the #16161a ground
  light: [1.0, 0.992, 0.968], // bleach: a touch brighter than the #f2eee6 ground
};
