import { INK_SPLASH_EVENT } from './inkTrail';
import { switchTheme } from './themeSwitch';

/**
 * Keyboard shortcuts, for visitors who keep their hands on the keyboard. Single keys,
 * no modifiers, ignored while typing in a field. `g` starts a two-key "go to".
 */

export interface Shortcut {
  keys: string[];
  label: string;
}

/** Sections reachable with `g` + a letter; ids are the home page's section anchors. */
const GO_TO: Record<string, { id: string; label: string }> = {
  h: { id: 'top', label: 'Go to the top of the home page' },
  p: { id: 'projects', label: 'Go to Projects' },
  e: { id: 'engineering', label: 'Go to Engineering' },
  a: { id: 'about', label: 'Go to About' },
  r: { id: 'resume', label: 'Go to Résumé' },
  c: { id: 'contact', label: 'Go to Contact' },
};

/** Listed in the help dialog, in this order. The `ink` sequence is deliberately left out. */
export const SHORTCUTS: Shortcut[] = [
  { keys: ['?'], label: 'Show or hide these shortcuts' },
  { keys: ['t'], label: 'Switch between light and dark' },
  ...Object.entries(GO_TO).map(([key, { label }]) => ({ keys: ['g', key], label })),
  { keys: ['g', 'n'], label: 'Next project (on a case study)' },
];

export const OPEN_SHORTCUTS_EVENT = 'shortcuts:open';

/** A second key must follow `g` within this long (ms). */
const SEQUENCE_MS = 1000;

/** True when a key press belongs to whatever has focus (a field, an editor, a select). */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

export type Action =
  | { type: 'help' }
  | { type: 'theme' }
  | { type: 'go'; id: string }
  | { type: 'next' }
  | { type: 'ink' };

/**
 * Turns key presses into actions. Kept free of the DOM so it can be tested directly:
 * `press` takes the key and a timestamp and returns the action, if any.
 */
export function createKeyReader() {
  let recent = '';
  let last = -Infinity;
  return function press(key: string, now: number): Action | null {
    if (now - last > SEQUENCE_MS) recent = '';
    last = now;
    const k = key.length === 1 ? key.toLowerCase() : '';
    if (!k) {
      recent = '';
      return null;
    }
    const previous = recent.slice(-1);
    recent = (recent + k).slice(-3);

    if (recent === 'ink') {
      recent = '';
      return { type: 'ink' };
    }
    if (previous === 'g') {
      recent = '';
      if (k === 'n') return { type: 'next' };
      const target = GO_TO[k];
      return target ? { type: 'go', id: target.id } : null;
    }
    if (k === '?') return { type: 'help' };
    if (k === 't') return { type: 'theme' };
    return null;
  };
}

/** Carries out an action on the current page. */
export function run(action: Action, toggleHelp: () => void): void {
  switch (action.type) {
    case 'help':
      toggleHelp();
      return;
    case 'theme': {
      const toggle = document.querySelector<HTMLElement>('.theme-toggle');
      if (toggle) switchTheme(toggle);
      return;
    }
    case 'go': {
      // Same page: let the browser jump (smoothly, unless reduced motion). Elsewhere: go home.
      if (document.getElementById(action.id)) window.location.hash = action.id;
      else window.location.href = action.id === 'top' ? '/' : `/#${action.id}`;
      return;
    }
    case 'next':
      document.querySelector<HTMLAnchorElement>('.next-project__card')?.click();
      return;
    case 'ink':
      window.dispatchEvent(new Event(INK_SPLASH_EVENT));
      return;
  }
}
