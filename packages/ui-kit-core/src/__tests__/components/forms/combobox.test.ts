import { describe, expect, it } from 'vitest';
import {
  clampHighlight,
  comboboxClasses,
  comboboxKeydown,
  comboboxListboxId,
  comboboxOptionClasses,
  comboboxOptionId,
  comboboxRows,
  cycleHighlight,
  filterComboboxOptions,
  focusRing,
  sizeHeight,
  surfaceClasses,
  type ComboboxClassOptions,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('combobox options', () => {
  it('filters by a case-insensitive part of the label, keeping every option for an empty query', () => {
    expect(filterComboboxOptions(FRUITS, 'AN').map((o) => o.value)).toEqual(['banana']);
    expect(filterComboboxOptions(FRUITS, 'e').map((o) => o.value)).toEqual(['apple', 'cherry']);
    expect(filterComboboxOptions(FRUITS, '')).toEqual(FRUITS);
    expect(filterComboboxOptions(FRUITS, 'zz')).toEqual([]);
  });

  it('lists ungrouped options as given, without headings', () => {
    const { rows, items } = comboboxRows(FRUITS);
    expect(items).toEqual(FRUITS);
    expect(rows).toEqual(FRUITS.map((option, index) => ({ kind: 'item', option, index, key: `i-${option.value}` })));
  });

  it('lists grouped options under their heading, groups in order of first appearance', () => {
    const options = [
      { value: 'us', label: 'United States', group: 'Americas' },
      { value: 'es', label: 'Spain', group: 'Europe' },
      { value: 'mx', label: 'Mexico', group: 'Americas' },
      { value: 'aq', label: 'Antarctica' },
    ];
    const { rows, items } = comboboxRows(options);
    expect(items.map((o) => o.value)).toEqual(['us', 'mx', 'es', 'aq']);
    expect(rows.map((row) => (row.kind === 'heading' ? `# ${row.heading}` : `${row.index} ${row.option.value}`))).toEqual([
      '# Americas',
      '0 us',
      '1 mx',
      '# Europe',
      '2 es',
      '3 aq',
    ]);
    expect(rows[0]).toEqual({ kind: 'heading', heading: 'Americas', key: 'h-Americas' });
  });

  it('names the listbox and its options after the generated id', () => {
    expect(comboboxListboxId(':r1:')).toBe(':r1:-listbox');
    expect(comboboxOptionId(':r1:-listbox', 'apple')).toBe(':r1:-listbox-opt-apple');
  });

  it('moves a highlight round the ends, and keeps it on a shrinking list', () => {
    expect(cycleHighlight(2, 1, 3)).toBe(0);
    expect(cycleHighlight(0, -1, 3)).toBe(2);
    expect(cycleHighlight(1, 1, 3)).toBe(2);
    expect(clampHighlight(4, 2)).toBe(1);
    expect(clampHighlight(1, 3)).toBe(1);
    expect(clampHighlight(3, 0)).toBe(0);
  });
});

describe('combobox keyboard', () => {
  const at = (open: boolean, highlighted: number, count = 3) => ({ open, highlighted, count });

  it('opens with ArrowDown, ArrowUp and Enter while closed', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter']) expect(comboboxKeydown(key, at(false, 0))).toEqual({ kind: 'open' });
  });

  it('moves the highlight round the listed options while open', () => {
    expect(comboboxKeydown('ArrowDown', at(true, 2))).toEqual({ kind: 'highlight', index: 0 });
    expect(comboboxKeydown('ArrowUp', at(true, 0))).toEqual({ kind: 'highlight', index: 2 });
    expect(comboboxKeydown('ArrowDown', at(true, 0, 0))).toEqual({ kind: 'none' });
    expect(comboboxKeydown('ArrowUp', at(true, 0, 0))).toEqual({ kind: 'none' });
  });

  it('moves it to the ends with Home and End, open or closed', () => {
    expect(comboboxKeydown('Home', at(true, 2))).toEqual({ kind: 'highlight', index: 0 });
    expect(comboboxKeydown('End', at(false, 0))).toEqual({ kind: 'highlight', index: 2 });
    expect(comboboxKeydown('End', at(true, 0, 0))).toEqual({ kind: 'highlight', index: 0 });
  });

  it('selects the highlighted option with Enter, if one is listed', () => {
    expect(comboboxKeydown('Enter', at(true, 1))).toEqual({ kind: 'select', index: 1 });
    expect(comboboxKeydown('Enter', at(true, 0, 0))).toEqual({ kind: 'none' });
  });

  it('leaves other keys alone', () => {
    for (const key of [' ', 'Escape', 'Tab', 'a']) expect(comboboxKeydown(key, at(true, 0))).toBeNull();
    expect(comboboxKeydown(' ', at(false, 0))).toBeNull();
  });
});

describe('combobox recipes', () => {
  const closed: ComboboxClassOptions = { size: 'md', invalid: false, disabled: false, open: false, hasValue: false };

  it('composes the trigger from the surface and size, red with an error and dimmed while disabled', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(comboboxClasses(surface, { ...closed, size: 'lg' }).trigger).toBe(
        `flex w-full items-center justify-between bg-retro-surface/40 px-3 focus-visible:outline-hidden ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.lg} ${focusRing} border-retro-border-strong`,
      );
      expect(comboboxClasses(surface, { ...closed, invalid: true, disabled: true }).trigger).toContain(
        'border-retro-red/60 opacity-50 cursor-not-allowed',
      );
    }
  });

  it('mutes the placeholder, turns the chevron while open and thickens the pixel search rule', () => {
    expect(comboboxClasses('pixel', closed).value).toBe('min-w-0 truncate text-retro-muted');
    expect(comboboxClasses('pixel', { ...closed, hasValue: true }).value).toBe('min-w-0 truncate text-retro-text');
    expect(comboboxClasses('pixel', { ...closed, open: true }).chevron).toBe(
      'ml-2 shrink-0 text-retro-muted transition-transform rotate-180',
    );
    expect(comboboxClasses('pixel', closed).search).toBe('flex items-center gap-2 px-2 py-1 mb-1 border-b border-retro-border border-b-2');
    const c = comboboxClasses('linear', closed);
    expect(c.search).toBe('flex items-center gap-2 px-2 py-1 mb-1 border-b border-retro-border');
    expect([c.container, c.content, c.listbox, c.label, c.check]).toEqual([
      'relative',
      'w-64 p-1',
      'max-h-60 overflow-y-auto',
      'flex-1 truncate',
      'shrink-0 text-retro-muted',
    ]);
    expect(c.input).toBe('w-full bg-transparent text-sm text-retro-text outline-none placeholder:text-retro-muted font-sans');
    expect(c.empty).toBe('px-2 py-4 text-center text-xs text-retro-muted font-sans');
    expect(c.heading).toBe('px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-retro-muted font-sans');
  });

  // Regression: a disabled option kept `cursor-pointer`, which Tailwind
  // emits after `cursor-not-allowed`.
  it('shades the highlighted option and dims a disabled one', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const start = `flex items-center gap-2 px-2 py-1.5 text-sm text-retro-text ${s.font} ${s.radius}`;
      expect(comboboxOptionClasses(surface, { highlighted: true, disabled: false })).toBe(`${start} bg-retro-surface/80 cursor-pointer`);
      expect(comboboxOptionClasses(surface, { highlighted: false, disabled: true })).toBe(
        `${start} hover:bg-retro-surface/40 opacity-50 cursor-not-allowed`,
      );
    }
  });
});
