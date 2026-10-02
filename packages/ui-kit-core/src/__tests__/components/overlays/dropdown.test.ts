import { describe, expect, it } from 'vitest';
import {
  DROPDOWN_PLACEMENT,
  DROPDOWN_TYPEAHEAD_RESET_MS,
  dropdownChevronClasses,
  dropdownContentClasses,
  dropdownHeaderClasses,
  dropdownItemClasses,
  dropdownMark,
  dropdownMiddleware,
  dropdownRootClasses,
  dropdownSeparatorClasses,
  dropdownShortcutClasses,
  dropdownToneTextClasses,
  dropdownTypeaheadMatch,
  isTypeaheadKey,
  nextDropdownHighlight,
  surfaceClasses,
  type Tone,
} from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);
const idle = { highlighted: false, disabled: false };

describe('dropdown placement', () => {
  it('opens 6 px below the trigger, start-aligned, shifting into view without flipping', () => {
    expect(DROPDOWN_PLACEMENT).toBe('bottom-start');
    const middleware = dropdownMiddleware();
    expect(middleware.map((m) => m.name)).toEqual(['offset', 'shift']);
    expect(middleware[0]!.options).toBe(6);
    expect(middleware[1]!.options).toEqual({ padding: 8 });
  });
});

describe('dropdown recipes', () => {
  it('anchors the menu to an inline root and turns the chevron over while open', () => {
    expect(dropdownRootClasses).toBe('relative inline-block');
    expect(dropdownChevronClasses(false)).toBe('transition-transform');
    expect(dropdownChevronClasses(true)).toBe('transition-transform rotate-180');
  });

  it('draws the menu and the shortcut chips with the surface tokens', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(dropdownContentClasses(surface)).toBe(
        `z-40 min-w-44 max-w-[calc(100vw-1rem)] bg-retro-bg p-1 shadow-xl ${s.border} ${s.radiusLg} border-retro-border`,
      );
      expect(dropdownShortcutClasses(surface)).toContain(`${s.border} ${s.radius} border-retro-border ${s.font}`);
      expect(dropdownItemClasses(surface, idle).endsWith(`${s.font} ${s.radius}`)).toBe(true);
    }
    expect(dropdownSeparatorClasses).toBe('my-1 h-px bg-retro-border/60');
    expect(dropdownHeaderClasses).toContain('font-pixel uppercase');
  });

  it('fills the highlighted item, dims a disabled one and colours it with its tone', () => {
    expect(classesOf(dropdownItemClasses('pixel', { ...idle, highlighted: true }))).toEqual(
      expect.arrayContaining(['bg-retro-surface', 'text-retro-text']),
    );
    expect(dropdownItemClasses('pixel', { ...idle, disabled: true })).toContain('cursor-not-allowed opacity-50');
    expect(dropdownItemClasses('pixel', idle)).not.toContain('opacity-50');
    for (const tone of Object.keys(dropdownToneTextClasses) as Tone[]) {
      expect(dropdownItemClasses('pixel', { ...idle, tone })).toContain(`text-retro-${tone}`);
    }
    expect(dropdownItemClasses('pixel', { ...idle, tone: 'neutral' })).toBe(dropdownItemClasses('pixel', idle));
  });

  it('marks checked checkbox and radio items', () => {
    expect(dropdownMark('checkbox', true)).toBe('✓');
    expect(dropdownMark('radio', true)).toBe('●');
    expect(dropdownMark('checkbox', false)).toBe('');
    expect(dropdownMark('radio', undefined)).toBe('');
  });
});

describe('dropdown keyboard', () => {
  const values = ['a', 'b', 'c'];

  it('moves the highlight one item at a time, stopping at the ends', () => {
    expect(nextDropdownHighlight(values, null, 1)).toBe('a');
    expect(nextDropdownHighlight(values, 'a', 1)).toBe('b');
    expect(nextDropdownHighlight(values, 'c', 1)).toBe('c');
    expect(nextDropdownHighlight(values, 'b', -1)).toBe('a');
    expect(nextDropdownHighlight(values, 'a', -1)).toBe('a');
    expect(nextDropdownHighlight(values, null, -1)).toBe('a');
    // A highlight that is no longer listed (disabled meanwhile) restarts from the top.
    expect(nextDropdownHighlight(values, 'gone', 1)).toBe('a');
    expect(nextDropdownHighlight([], null, 1)).toBeUndefined();
  });

  it('searches for single visible characters only', () => {
    expect(isTypeaheadKey('c')).toBe(true);
    expect(isTypeaheadKey('7')).toBe(true);
    expect(isTypeaheadKey(' ')).toBe(false);
    expect(isTypeaheadKey('Enter')).toBe(false);
    expect(DROPDOWN_TYPEAHEAD_RESET_MS).toBe(600);
  });

  it('jumps to the first label starting with the typed text, else the first containing it', () => {
    const labels: Record<string, string> = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry', blank: '' };
    const labelOf = (value: string) => labels[value];
    const enabled = ['apple', 'banana', 'cherry', 'blank', 'unlabelled'];
    expect(dropdownTypeaheadMatch(enabled, labelOf, 'b')).toBe('banana');
    expect(dropdownTypeaheadMatch(enabled, labelOf, 'CH')).toBe('cherry');
    expect(dropdownTypeaheadMatch(enabled, labelOf, 'an')).toBe('banana');
    expect(dropdownTypeaheadMatch(enabled, labelOf, 'z')).toBeUndefined();
  });
});
