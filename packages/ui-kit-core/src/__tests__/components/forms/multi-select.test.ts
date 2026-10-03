import { describe, expect, it } from 'vitest';
import {
  focusRing,
  inputBase,
  isMultiSelectFull,
  multiSelectCheckClasses,
  multiSelectClasses,
  multiSelectKeydown,
  multiSelectOptionClasses,
  sizeHeight,
  surfaceClasses,
  toggleMultiSelectValue,
  toneMap,
  type MultiSelectKeyState,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('multi-select values', () => {
  it('adds an unselected value at the end and removes a selected one', () => {
    expect(toggleMultiSelectValue(['react'], 'vue')).toEqual(['react', 'vue']);
    expect(toggleMultiSelectValue(['react', 'vue'], 'react')).toEqual(['vue']);
  });

  it('adds nothing to a full selection, but still removes from it', () => {
    expect(isMultiSelectFull(['a', 'b'], 2)).toBe(true);
    expect(isMultiSelectFull(['a'], 2)).toBe(false);
    expect(isMultiSelectFull(['a', 'b', 'c'], undefined)).toBe(false);
    expect(toggleMultiSelectValue(['a', 'b'], 'c', 2)).toBeNull();
    expect(toggleMultiSelectValue(['a', 'b'], 'a', 2)).toEqual(['b']);
    expect(toggleMultiSelectValue(['a'], 'c', 2)).toEqual(['a', 'c']);
  });
});

describe('multi-select keyboard', () => {
  const state = (overrides: Partial<MultiSelectKeyState> = {}): MultiSelectKeyState => ({
    open: true,
    highlighted: 0,
    count: 3,
    canToggle: () => true,
    query: '',
    selected: 0,
    ...overrides,
  });

  it('opens with the arrows, Enter and Space while closed', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
      expect(multiSelectKeydown(key, state({ open: false }))).toEqual({ kind: 'open' });
    }
  });

  it('moves the highlight round the listed options, and to the ends with Home and End', () => {
    expect(multiSelectKeydown('ArrowDown', state({ highlighted: 2 }))).toEqual({ kind: 'highlight', index: 0 });
    expect(multiSelectKeydown('ArrowUp', state())).toEqual({ kind: 'highlight', index: 2 });
    expect(multiSelectKeydown('ArrowDown', state({ count: 0 }))).toEqual({ kind: 'none' });
    expect(multiSelectKeydown('Home', state({ highlighted: 2, open: false }))).toEqual({ kind: 'highlight', index: 0 });
    expect(multiSelectKeydown('End', state())).toEqual({ kind: 'highlight', index: 2 });
    expect(multiSelectKeydown('End', state({ count: 0 }))).toEqual({ kind: 'highlight', index: 0 });
  });

  it('toggles the highlighted option with Enter and Space, when it can be toggled', () => {
    expect(multiSelectKeydown('Enter', state({ highlighted: 1 }))).toEqual({ kind: 'toggle', index: 1 });
    expect(multiSelectKeydown(' ', state({ highlighted: 1 }))).toEqual({ kind: 'toggle', index: 1 });
    expect(multiSelectKeydown('Enter', state({ canToggle: (index) => index !== 1, highlighted: 1 }))).toBeNull();
    expect(multiSelectKeydown('Enter', state({ count: 0 }))).toBeNull();
  });

  it('types a space in the search field, where Enter still toggles', () => {
    expect(multiSelectKeydown(' ', state({ inSearch: true }))).toBeNull();
    expect(multiSelectKeydown('Enter', state({ inSearch: true }))).toEqual({ kind: 'toggle', index: 0 });
  });

  it('removes the last value with Backspace while the search is empty', () => {
    expect(multiSelectKeydown('Backspace', state({ selected: 2 }))).toEqual({ kind: 'removeLast' });
    expect(multiSelectKeydown('Backspace', state({ selected: 2, query: 're' }))).toBeNull();
    expect(multiSelectKeydown('Backspace', state())).toBeNull();
  });

  it('leaves other keys alone', () => {
    for (const key of ['Escape', 'Tab', 'a']) expect(multiSelectKeydown(key, state())).toBeNull();
  });
});

describe('multi-select recipes', () => {
  it('composes the trigger from the surface and size, red with an error', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(multiSelectClasses(surface, { size: 'sm', invalid: false, open: false }).trigger).toBe(
        `flex w-full items-center justify-between gap-2 px-3 outline-none ${inputBase} ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.sm} ${focusRing} ${toneMap.neutral.ring} border-retro-border-strong`,
      );
      expect(multiSelectClasses(surface, { size: 'md', invalid: true, open: false }).trigger).toContain('border-retro-red/60');
      expect(multiSelectClasses(surface, { size: 'md', invalid: false, open: false }).chip).toBe(
        `inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] ${s.border} ${s.radiusFull} ${toneMap.neutral.border} ${toneMap.neutral.soft} text-retro-text`,
      );
    }
  });

  it('turns the chevron while open, and draws the pixel rules thicker', () => {
    const pixel = multiSelectClasses('pixel', { size: 'md', invalid: false, open: true });
    const linear = multiSelectClasses('linear', { size: 'md', invalid: false, open: false });
    expect(pixel.chevron).toBe('text-retro-muted transition-transform rotate-180');
    expect(linear.chevron).toBe('text-retro-muted transition-transform');
    expect(pixel.search).toBe('mb-1 flex items-center px-2 py-1.5 border-b-2 border-retro-border');
    expect(linear.search).toBe('mb-1 flex items-center px-2 py-1.5 border-b-2 border-retro-border border-b');
    expect(pixel.footer).toBe('mt-1 px-2 py-1 text-[10px] text-retro-muted font-mono border-t-2 border-retro-border');
    expect(linear.footer).toBe('mt-1 px-2 py-1 text-[10px] text-retro-muted font-sans border-t-2 border-retro-border border-t');
    expect(linear.input).toBe('w-full bg-transparent text-xs text-retro-text outline-none placeholder:text-retro-muted font-sans');
    expect(linear.empty).toBe('px-3 py-2 text-center text-xs text-retro-muted font-sans');
    expect([linear.values, linear.placeholder, linear.content, linear.listbox, linear.actions]).toEqual([
      'flex min-w-0 flex-1 flex-wrap items-center gap-1',
      'truncate text-retro-muted',
      'p-1 w-[var(--pxl-multiselect-w,16rem)]',
      'max-h-60 overflow-y-auto',
      'ml-1 flex shrink-0 items-center gap-1',
    ]);
  });

  it('tints selected options, shades the highlighted one and dims disabled ones', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const start = `flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs text-retro-text ${s.font} ${s.radius}`;
      expect(multiSelectOptionClasses(surface, { selected: true, highlighted: true, disabled: false })).toBe(
        `${start} ${toneMap.neutral.soft} text-retro-text bg-retro-surface/60`,
      );
      expect(multiSelectOptionClasses(surface, { selected: false, highlighted: false, disabled: false })).toBe(
        `${start} text-retro-muted hover:bg-retro-surface hover:text-retro-text`,
      );
      expect(multiSelectOptionClasses(surface, { selected: false, highlighted: true, disabled: true })).toBe(
        `${start} text-retro-muted opacity-50 cursor-not-allowed`,
      );
      expect(multiSelectCheckClasses(surface, true)).toBe(
        `flex h-[14px] w-[14px] shrink-0 items-center justify-center ${s.border} ${s.radius} ${toneMap.neutral.border} ${toneMap.neutral.bg}`,
      );
      expect(multiSelectCheckClasses(surface, false)).toContain('border-retro-border-strong bg-retro-bg');
    }
  });
});
