import { describe, expect, it } from 'vitest';
import {
  commandClasses,
  commandLayerClasses,
  commandMatches,
  commandOptionClasses,
  commandOptionId,
  commandRows,
  matchesCommandShortcut,
  parseCommandShortcut,
  surfaceClasses,
} from '../../../index';

const press = (key: string, modifiers: Partial<Record<'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey', boolean>> = {}) => ({
  key,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...modifiers,
});

const groups = [
  {
    heading: 'Navigation',
    items: [
      { id: 'home', label: 'Go home', keywords: ['dashboard'] },
      { id: 'settings', label: 'Open settings', keywords: ['Prefs'] },
    ],
  },
  { heading: 'Actions', items: [{ id: 'logout', label: 'Log out' }] },
];

describe('command shortcut', () => {
  it('parses the key and every spelling of each modifier, in any case', () => {
    expect(parseCommandShortcut('mod+k')).toEqual({ key: 'k', mod: true, shift: false, alt: false });
    expect(parseCommandShortcut('Ctrl + Shift + P')).toEqual({ key: 'p', mod: true, shift: true, alt: false });
    for (const mod of ['cmd', 'meta', 'CTRL']) expect(parseCommandShortcut(`${mod}+j`).mod).toBe(true);
    for (const alt of ['alt', 'opt', 'Option']) expect(parseCommandShortcut(`${alt}+/`)).toEqual({ key: '/', mod: false, shift: false, alt: true });
  });

  it('matches its key with exactly its modifiers, Cmd or Ctrl standing for mod', () => {
    const modK = parseCommandShortcut('mod+k');
    expect(matchesCommandShortcut(press('k', { metaKey: true }), modK)).toBe(true);
    expect(matchesCommandShortcut(press('K', { ctrlKey: true }), modK)).toBe(true);
    expect(matchesCommandShortcut(press('k'), modK)).toBe(false);
    expect(matchesCommandShortcut(press('j', { ctrlKey: true }), modK)).toBe(false);
    expect(matchesCommandShortcut(press('k', { ctrlKey: true, shiftKey: true }), modK)).toBe(false);
    expect(matchesCommandShortcut(press('k', { ctrlKey: true, altKey: true }), modK)).toBe(false);
    const modShiftP = parseCommandShortcut('mod+shift+p');
    expect(matchesCommandShortcut(press('P', { metaKey: true, shiftKey: true }), modShiftP)).toBe(true);
    expect(matchesCommandShortcut(press('p', { metaKey: true }), modShiftP)).toBe(false);
  });
});

describe('command search', () => {
  it('matches the label or a keyword containing the query, in any case', () => {
    const item = { id: 'settings', label: 'Open Settings', keywords: ['Preferences', 'config'] };
    expect(commandMatches(item, '')).toBe(true);
    expect(commandMatches(item, 'settings')).toBe(true);
    expect(commandMatches(item, 'PREF')).toBe(true);
    expect(commandMatches(item, 'fig')).toBe(true);
    expect(commandMatches(item, 'logout')).toBe(false);
    expect(commandMatches({ id: 'x', label: 'Plain' }, 'zz')).toBe(false);
  });

  it('lists the matching commands under their headings and numbers them in order', () => {
    const all = commandRows(groups, '');
    expect(all.rows.map((row) => row.key)).toEqual(['h-Navigation', 'i-home', 'i-settings', 'h-Actions', 'i-logout']);
    expect(all.items.map((item) => item.id)).toEqual(['home', 'settings', 'logout']);
    expect(all.rows.flatMap((row) => (row.kind === 'item' ? [row.index] : []))).toEqual([0, 1, 2]);
  });

  it('leaves out groups without a match', () => {
    const filtered = commandRows(groups, 'out');
    expect(filtered.rows).toEqual([
      { kind: 'heading', heading: 'Actions', key: 'h-Actions' },
      { kind: 'item', item: groups[1]!.items[0], index: 0, key: 'i-logout' },
    ]);
    expect(commandRows(groups, 'prefs').items.map((item) => item.id)).toEqual(['settings']);
    expect(commandRows(groups, 'nothing')).toEqual({ rows: [], items: [] });
  });

  it('ids each option after the listbox', () => {
    expect(commandOptionId('lb', 'home')).toBe('lb-opt-home');
  });
});

describe('command recipes', () => {
  it('places the palette near the top of the viewport', () => {
    expect(commandLayerClasses).toBe('fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[10vh]');
  });

  it('draws the panel, field and list with the surface tokens', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const classes = commandClasses(surface);
      expect(classes.panel).toContain(`${s.border} ${s.radiusLg} border-retro-border`);
      expect(classes.input).toContain(s.font);
      expect(classes.shortcut).toContain(`${s.border} ${s.radius} border-retro-border ${s.font}`);
      expect(classes.listbox).toBe('max-h-[60vh] overflow-y-auto p-1');
    }
    expect(commandClasses('pixel').search.split(' ')).not.toContain('border-b');
    expect(commandClasses('linear').search.split(' ')).toContain('border-b');
    // Regression: the linear field added `border-b` to the pixel `border-b-2`,
    // which Tailwind emits after it, so its rule stayed 2px thick.
    expect(commandClasses('pixel').search.split(' ')).toContain('border-b-2');
    expect(commandClasses('linear').search.split(' ')).not.toContain('border-b-2');
  });

  it('fills the highlighted option and lights the others on hover', () => {
    expect(commandOptionClasses('pixel', true)).toContain('bg-retro-surface/80 text-retro-text');
    expect(commandOptionClasses('pixel', true)).not.toContain('hover:');
    expect(commandOptionClasses('linear', false)).toContain('hover:bg-retro-surface/40');
    expect(commandOptionClasses('linear', false)).toContain('rounded-md');
  });
});
