import { describe, expect, it } from 'vitest';
import { SHORTCUTS, createKeyReader, isTyping } from './keyShortcuts';

describe('createKeyReader', () => {
  it('maps single keys, case-insensitively', () => {
    const press = createKeyReader();
    expect(press('?', 0)).toEqual({ type: 'help' });
    expect(press('t', 2000)).toEqual({ type: 'theme' });
    expect(press('T', 4000)).toEqual({ type: 'theme' });
    expect(press('x', 6000)).toBeNull();
  });

  it('reads g + letter as a jump, and g + n as the next project', () => {
    const press = createKeyReader();
    expect(press('g', 0)).toBeNull();
    expect(press('c', 300)).toEqual({ type: 'go', id: 'contact' });
    expect(press('g', 1000)).toBeNull();
    expect(press('p', 1200)).toEqual({ type: 'go', id: 'projects' });
    expect(press('g', 3000)).toBeNull();
    expect(press('n', 3100)).toEqual({ type: 'next' });
  });

  it('forgets a g that is not followed quickly, so the next key acts alone', () => {
    const press = createKeyReader();
    press('g', 0);
    expect(press('t', 1500)).toEqual({ type: 'theme' });
  });

  it('spots the hidden ink sequence without firing anything on the way', () => {
    const press = createKeyReader();
    expect(press('i', 0)).toBeNull();
    expect(press('n', 100)).toBeNull();
    expect(press('k', 200)).toEqual({ type: 'ink' });
  });

  it('ignores named keys and resets on them', () => {
    const press = createKeyReader();
    press('g', 0);
    expect(press('Shift', 50)).toBeNull();
    expect(press('c', 100)).toBeNull();
  });

  it('lists every documented shortcut, and keeps the ink one secret', () => {
    expect(SHORTCUTS.map((s) => s.keys.join(' '))).toEqual(['?', 't', 'g h', 'g p', 'g e', 'g a', 'g c', 'g n']);
  });
});

describe('isTyping', () => {
  it('is true for fields and editable content only', () => {
    const input = document.createElement('input');
    const div = document.createElement('div');
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    expect(isTyping(input)).toBe(true);
    expect(isTyping(div)).toBe(false);
    expect(isTyping(null)).toBe(false);
  });
});
