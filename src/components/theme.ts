import { useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

export const THEME_KEY = 'theme';

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme, persist: boolean) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'light' ? '#f2eee6' : '#16161a');
  if (!persist) return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
}

// data-theme on <html> is the one source of truth: the inline script in each
// page sets it before first paint, applyTheme changes it. Components subscribe
// to it rather than keeping their own copy.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/** The theme in effect now, whether chosen by the visitor or followed from the system. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => 'dark');
}
