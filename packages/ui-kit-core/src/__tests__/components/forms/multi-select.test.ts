import { afterEach, describe, expect, it } from 'vitest';
import {
  isMultiSelectFull,
  multiSelectCheckClasses,
  multiSelectClasses,
  multiSelectKeydown,
  multiSelectOptionClasses,
  passMultiSelectFocus,
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

describe('multi-select focus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  function field() {
    document.body.innerHTML = `
      <div>
        <span id="values">
          <span>Apple <button id="apple" type="button">×</button></span>
          <span>Banana <button id="banana" type="button">×</button></span>
          <button id="combobox" type="button" role="combobox"></button>
        </span>
        <button id="clear" type="button">×</button>
      </div>`;
    const element = (id: string) => document.getElementById(id)!;
    return { element, values: element('values'), combobox: element('combobox') };
  }

  it("hands a chip's focus to the next chip's remove button, then to the combobox", () => {
    const { element, values, combobox } = field();
    element('apple').focus();
    passMultiSelectFocus(element('apple'), values, combobox);
    expect(document.activeElement).toBe(element('banana'));
    passMultiSelectFocus(element('banana'), values, combobox);
    expect(document.activeElement).toBe(combobox);
  });

  it("hands the clear button's focus to the combobox", () => {
    const { element, values, combobox } = field();
    element('clear').focus();
    passMultiSelectFocus(element('clear'), values, combobox);
    expect(document.activeElement).toBe(combobox);
    element('clear').focus();
    passMultiSelectFocus(element('clear'), null, combobox);
    expect(document.activeElement).toBe(combobox);
  });

  it('moves nothing when the button pressed does not hold focus', () => {
    const { element, values, combobox } = field();
    element('banana').focus();
    passMultiSelectFocus(element('apple'), values, combobox);
    expect(document.activeElement).toBe(element('banana'));
    passMultiSelectFocus(element('clear'), values, combobox);
    expect(document.activeElement).toBe(element('banana'));
  });
});

describe('multi-select recipes', () => {
  it('draws the field from the surface and size, red with an error, with the focus of the combobox inside', () => {
    // The pixel field's cut corners would clip a ring: its edge lights up instead.
    const focus: Record<Surface, string> = {
      pixel: 'has-[[role=combobox]:focus-visible]:pxl-focus-inset',
      linear:
        'has-[[role=combobox]:focus-visible]:ring-2 has-[[role=combobox]:focus-visible]:ring-offset-2 has-[[role=combobox]:focus-visible]:ring-offset-retro-bg has-[[role=combobox]:focus-visible]:ring-retro-border/60',
    };
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(multiSelectClasses(surface, { size: 'sm', invalid: false, open: false }).field).toBe(
        [
          'flex w-full cursor-default select-none items-center justify-between gap-2 px-3',
          'bg-retro-surface/40 focus-within:bg-retro-surface/70 text-retro-text transition-all',
          focus[surface],
          'has-[[role=combobox]:disabled]:opacity-50 has-[[role=combobox]:disabled]:cursor-not-allowed',
          `${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.sm} border-retro-border-strong`,
        ].join(' '),
      );
      expect(multiSelectClasses(surface, { size: 'md', invalid: true, open: false }).field).toContain('border-retro-red/60');
      expect(multiSelectClasses(surface, { size: 'md', invalid: false, open: false }).chip).toBe(
        `inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] ${s.border} ${s.radiusFull} ${toneMap.neutral.border} ${toneMap.neutral.soft} text-retro-text`,
      );
    }
  });

  // Regression: the linear rules added `border-b` and `border-t` to the
  // pixel `border-b-2` and `border-t-2`, which Tailwind emits after them, so
  // they stayed 2px thick.
  it('turns the chevron while open, and draws the pixel rules thicker', () => {
    const pixel = multiSelectClasses('pixel', { size: 'md', invalid: false, open: true });
    const linear = multiSelectClasses('linear', { size: 'md', invalid: false, open: false });
    expect(pixel.chevron).toBe('text-retro-muted transition-transform rotate-180');
    expect(linear.chevron).toBe('text-retro-muted transition-transform');
    expect(pixel.search).toBe('mb-1 flex items-center px-2 py-1.5 border-b-2 border-retro-border');
    expect(linear.search).toBe('mb-1 flex items-center px-2 py-1.5 border-b border-retro-border');
    expect(pixel.footer).toBe('mt-1 px-2 py-1 text-[10px] text-retro-muted font-mono border-t-2 border-retro-border');
    expect(linear.footer).toBe('mt-1 px-2 py-1 text-[10px] text-retro-muted font-sans border-t border-retro-border');
    expect(linear.input).toBe('w-full bg-transparent text-xs text-retro-text outline-none placeholder:text-retro-muted font-sans');
    expect(linear.empty).toBe('px-3 py-2 text-center text-xs text-retro-muted font-sans');
    expect([linear.values, linear.trigger, linear.placeholder, linear.content, linear.listbox, linear.actions]).toEqual([
      'flex min-w-0 flex-1 flex-wrap items-center gap-1',
      'flex min-w-0 flex-1 items-center self-stretch text-left focus-visible:outline-hidden',
      'truncate text-retro-muted',
      'p-1 w-[var(--pxl-multiselect-w,16rem)]',
      'max-h-60 overflow-y-auto',
      'ml-1 flex shrink-0 items-center gap-1',
    ]);
  });

  it('gives the remove and clear buttons a focus ring of their own', () => {
    const ring = 'rounded-[2px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-retro-cyan/40';
    const classes = multiSelectClasses('pixel', { size: 'md', invalid: false, open: false });
    expect(classes.chipRemove).toBe(`inline-flex shrink-0 items-center text-retro-muted hover:text-retro-text cursor-pointer ${ring}`);
    expect(classes.clear).toBe(`inline-flex items-center text-retro-muted hover:text-retro-text cursor-pointer ${ring}`);
  });

  // Regression: every option also took `text-retro-text` and
  // `cursor-pointer`, which Tailwind emits after `text-retro-muted` and
  // `cursor-not-allowed`, so unselected options were not muted and disabled
  // ones kept the pointer.
  it('tints selected options, shades the highlighted one and dims disabled ones', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const start = `flex items-center gap-2 px-2 py-1.5 text-xs ${s.font} ${s.radius}`;
      expect(multiSelectOptionClasses(surface, { selected: true, highlighted: true, disabled: false })).toBe(
        `${start} ${toneMap.neutral.soft} text-retro-text bg-retro-surface/60 cursor-pointer`,
      );
      expect(multiSelectOptionClasses(surface, { selected: false, highlighted: false, disabled: false })).toBe(
        `${start} text-retro-muted cursor-pointer hover:bg-retro-surface hover:text-retro-text`,
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
