/**
 * PixelMultiSelect — a combobox that picks several values: the picked ones
 * show as chips in the trigger, the listbox in a popover toggles them, up to
 * an optional `max`. The toggle and its cap, what each key does, and the
 * class recipes; the search filter is PixelCombobox's.
 */
import { cn, focusRing, inputBase, sizeHeight, surfaceClasses, toneMap, type Size, type Surface } from '../../common';
import { cycleHighlight } from './combobox';
import { fieldBorderClass } from './input';

/** Whether `max` values are selected, so no more can be. */
export function isMultiSelectFull(values: readonly string[], max: number | undefined): boolean {
  return typeof max === 'number' && values.length >= max;
}

/**
 * The values after toggling one: removed when selected, else added at the
 * end — or `null` when the selection is full and the value is not in it.
 */
export function toggleMultiSelectValue(values: readonly string[], value: string, max?: number): string[] | null {
  if (values.includes(value)) return values.filter((selected) => selected !== value);
  return isMultiSelectFull(values, max) ? null : [...values, value];
}

export interface MultiSelectKeyState {
  open: boolean;
  /** Index of the highlighted option among the listed ones. */
  highlighted: number;
  /** Options listed. */
  count: number;
  /** Whether the option at an index can be toggled: enabled, and selected or with room left. */
  canToggle(index: number): boolean;
  /** The search field's text. */
  query: string;
  /** How many values are selected. */
  selected: number;
  /** The key was pressed in the search field, where Space types a space. */
  inSearch?: boolean;
}

/** What a key does to a multi-select. */
export type MultiSelectKeyAction =
  | { kind: 'open' }
  | { kind: 'highlight'; index: number }
  | { kind: 'toggle'; index: number }
  | { kind: 'removeLast' }
  | { kind: 'none' };

/**
 * What a key pressed on the trigger or in the search field does. The arrows,
 * Enter and Space open a closed listbox; open, the arrows move the highlight
 * round the listed options, and Enter and Space toggle the highlighted one
 * (Space only from the trigger). Home and End move the highlight to the
 * first and last option, and Backspace with an empty search removes the last
 * value picked. The default action of every key handled is prevented; `null`
 * for the others — Enter on an option that cannot be toggled included.
 */
export function multiSelectKeydown(key: string, state: MultiSelectKeyState): MultiSelectKeyAction | null {
  const { open, highlighted, count } = state;
  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp':
      if (!open) return { kind: 'open' };
      return count === 0
        ? { kind: 'none' }
        : { kind: 'highlight', index: cycleHighlight(highlighted, key === 'ArrowDown' ? 1 : -1, count) };
    case 'Home':
      return { kind: 'highlight', index: 0 };
    case 'End':
      return { kind: 'highlight', index: Math.max(0, count - 1) };
    case ' ':
    case 'Enter':
      // In the search field, Space types.
      if (key === ' ' && state.inSearch) return null;
      if (!open) return { kind: 'open' };
      return highlighted < count && state.canToggle(highlighted) ? { kind: 'toggle', index: highlighted } : null;
    case 'Backspace':
      return !state.query && state.selected > 0 ? { kind: 'removeLast' } : null;
    default:
      return null;
  }
}

export interface MultiSelectClassOptions {
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
  open: boolean;
}

export interface MultiSelectClasses {
  trigger: string;
  /** The chips, or the placeholder. */
  values: string;
  placeholder: string;
  chip: string;
  /** An option's icon, on its chip or in the listbox. */
  icon: string;
  /** A chip's label. */
  chipLabel: string;
  /** A chip's × target. */
  chipRemove: string;
  chipRemoveGlyph: string;
  /** The clear target and the chevron. */
  actions: string;
  clear: string;
  clearGlyph: string;
  chevron: string;
  content: string;
  /** The row of the search field. */
  search: string;
  input: string;
  listbox: string;
  /** The message shown when nothing matches. */
  empty: string;
  /** An option's label. */
  label: string;
  checkGlyph: string;
  /** The count of a capped selection. */
  footer: string;
}

/** Classes of every part of a multi-select but its options. */
export function multiSelectClasses(surface: Surface, { size, invalid, open }: MultiSelectClassOptions): MultiSelectClasses {
  const s = surfaceClasses(surface);
  return {
    trigger: cn(
      'flex w-full items-center justify-between gap-2 px-3 outline-none',
      inputBase,
      s.font,
      s.border,
      s.radius,
      s.transition,
      sizeHeight[size],
      focusRing,
      toneMap.neutral.ring,
      fieldBorderClass(invalid),
    ),
    values: 'flex min-w-0 flex-1 flex-wrap items-center gap-1',
    placeholder: 'truncate text-retro-muted',
    chip: cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px]',
      s.border,
      s.radiusFull,
      toneMap.neutral.border,
      toneMap.neutral.soft,
      'text-retro-text',
    ),
    icon: 'opacity-80',
    chipLabel: 'truncate',
    chipRemove: 'inline-flex shrink-0 items-center text-retro-muted hover:text-retro-text cursor-pointer',
    chipRemoveGlyph: 'h-2 w-2',
    actions: 'ml-1 flex shrink-0 items-center gap-1',
    clear: 'inline-flex items-center text-retro-muted hover:text-retro-text cursor-pointer',
    clearGlyph: 'h-3 w-3',
    chevron: cn('text-retro-muted transition-transform', open && 'rotate-180'),
    content: 'p-1 w-[var(--pxl-multiselect-w,16rem)]',
    search: cn('mb-1 flex items-center px-2 py-1.5 border-b-2 border-retro-border', surface === 'linear' && 'border-b'),
    input: cn('w-full bg-transparent text-xs text-retro-text outline-none placeholder:text-retro-muted', s.font),
    listbox: 'max-h-60 overflow-y-auto',
    empty: cn('px-3 py-2 text-center text-xs text-retro-muted', s.font),
    label: 'flex-1 truncate',
    checkGlyph: 'h-2 w-2 text-retro-text',
    footer: cn('mt-1 px-2 py-1 text-[10px] text-retro-muted', s.font, 'border-t-2 border-retro-border', surface === 'linear' && 'border-t'),
  };
}

export interface MultiSelectOptionClassOptions {
  selected: boolean;
  /** The keyboard or the pointer highlights the option. */
  highlighted: boolean;
  /** Disabled, or unselected in a full selection. */
  disabled: boolean;
}

/** An option of the listbox. */
export function multiSelectOptionClasses(
  surface: Surface,
  { selected, highlighted, disabled }: MultiSelectOptionClassOptions,
): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs text-retro-text',
    s.font,
    s.radius,
    selected ? cn(toneMap.neutral.soft, 'text-retro-text') : 'text-retro-muted',
    highlighted && !disabled && 'bg-retro-surface/60',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && !highlighted && 'hover:bg-retro-surface hover:text-retro-text',
  );
}

/** An option's check box. */
export function multiSelectCheckClasses(surface: Surface, selected: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex h-[14px] w-[14px] shrink-0 items-center justify-center',
    s.border,
    s.radius,
    selected ? cn(toneMap.neutral.border, toneMap.neutral.bg) : 'border-retro-border-strong bg-retro-bg',
  );
}
