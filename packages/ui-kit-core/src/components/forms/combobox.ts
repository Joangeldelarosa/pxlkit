/**
 * PixelCombobox — a single-value combobox: a button trigger over a listbox in
 * a popover, with a search field that filters it. The filter (shared with
 * PixelMultiSelect), the rows the options make under their group headings,
 * the option ids, what each key does, and the class recipes.
 */
import { cn, focusRing, sizeHeight, surfaceClasses, type Size, type Surface } from '../../common';
import { commandMatches, commandOptionId } from '../overlays/command';
import { fieldBorderClass } from './input';

/** One choice of a combobox. */
export interface ComboboxOption {
  value: string;
  label: string;
  /** Heading the option is listed under; options of a group are listed together. */
  group?: string;
  disabled?: boolean;
}

/** The options whose label contains the query, in any case — every option for an empty query. */
export function filterComboboxOptions<O extends { value: string; label: string }>(options: readonly O[], query: string): O[] {
  return options.filter((option) => commandMatches({ id: option.value, label: option.label }, query));
}

/**
 * A row of the listbox: a group heading, or an option with its position
 * among the listed options (the keyboard highlight's index).
 */
export type ComboboxRow<O> =
  | { kind: 'heading'; heading: string; key: string }
  | { kind: 'item'; option: O; index: number; key: string };

/**
 * The listbox's rows and the options in the order they are listed: as given
 * when no option has a group, else grouped — groups in the order they first
 * appear, each under its heading (the options without a group, unheaded).
 */
export function comboboxRows<O extends ComboboxOption>(options: readonly O[]): { rows: ComboboxRow<O>[]; items: O[] } {
  const grouped = options.some((option) => option.group);
  const groups = new Map<string, O[]>();
  for (const option of options) {
    const group = grouped ? (option.group ?? '') : '';
    const members = groups.get(group);
    if (members) members.push(option);
    else groups.set(group, [option]);
  }
  const rows: ComboboxRow<O>[] = [];
  const items: O[] = [];
  for (const [group, members] of groups) {
    if (group) rows.push({ kind: 'heading', heading: group, key: `h-${group}` });
    for (const option of members) {
      rows.push({ kind: 'item', option, index: items.length, key: `i-${option.value}` });
      items.push(option);
    }
  }
  return { rows, items };
}

/** Id of the listbox of the combobox whose generated id is `baseId`. */
export function comboboxListboxId(baseId: string): string {
  return `${baseId}-listbox`;
}

/** Id of an option inside the listbox — a command palette's options are named the same way. */
export const comboboxOptionId: (listboxId: string, value: string) => string = commandOptionId;

/** The highlight `step` options on, wrapping round the ends of `count` options. */
export function cycleHighlight(highlighted: number, step: 1 | -1, count: number): number {
  return (highlighted + step + count) % count;
}

/** The highlight kept on a listed option as the list shrinks, or 0 for an empty list. */
export function clampHighlight(highlighted: number, count: number): number {
  return count === 0 ? 0 : Math.min(highlighted, count - 1);
}

export interface ComboboxKeyState {
  open: boolean;
  /** Index of the highlighted option among the listed ones. */
  highlighted: number;
  /** Options listed. */
  count: number;
}

/** What a key does to a combobox: open it, move the highlight, select an option, or nothing more. */
export type ComboboxKeyAction =
  | { kind: 'open' }
  | { kind: 'highlight'; index: number }
  | { kind: 'select'; index: number }
  | { kind: 'none' };

/**
 * What a key pressed on the trigger, in the search field or on the listbox
 * does. ArrowDown, ArrowUp and Enter open a closed combobox; open, the arrows
 * move the highlight round the listed options, and Enter selects the
 * highlighted one. Home and End move it to the first and last option. The
 * default action of every key handled is prevented; `null` for the others.
 */
export function comboboxKeydown(key: string, { open, highlighted, count }: ComboboxKeyState): ComboboxKeyAction | null {
  if (!open && (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter')) return { kind: 'open' };
  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp':
      return count === 0
        ? { kind: 'none' }
        : { kind: 'highlight', index: cycleHighlight(highlighted, key === 'ArrowDown' ? 1 : -1, count) };
    case 'Home':
      return { kind: 'highlight', index: 0 };
    case 'End':
      return { kind: 'highlight', index: Math.max(0, count - 1) };
    case 'Enter':
      return highlighted < count ? { kind: 'select', index: highlighted } : { kind: 'none' };
    default:
      return null;
  }
}

export interface ComboboxClassOptions {
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
  disabled: boolean;
  open: boolean;
  /** An option is selected; otherwise the trigger shows the placeholder. */
  hasValue: boolean;
}

export interface ComboboxClasses {
  /** Holds the hidden input and anchors the popover. */
  container: string;
  trigger: string;
  /** The selected option's label, or the placeholder. */
  value: string;
  chevron: string;
  content: string;
  /** The row of the search field. */
  search: string;
  input: string;
  /** The message shown when nothing matches. */
  empty: string;
  listbox: string;
  heading: string;
  /** An option's label. */
  label: string;
  /** The selected option's check mark. */
  check: string;
}

/** Classes of every part of a combobox but its options. */
export function comboboxClasses(surface: Surface, { size, invalid, disabled, open, hasValue }: ComboboxClassOptions): ComboboxClasses {
  const s = surfaceClasses(surface);
  return {
    container: 'relative',
    trigger: cn(
      'flex w-full items-center justify-between bg-retro-surface/40 px-3 outline-none',
      s.font,
      s.border,
      s.radius,
      s.transition,
      sizeHeight[size],
      focusRing,
      fieldBorderClass(invalid),
      disabled && 'opacity-50 cursor-not-allowed',
    ),
    value: cn('min-w-0 truncate', hasValue ? 'text-retro-text' : 'text-retro-muted'),
    chevron: cn('ml-2 shrink-0 text-retro-muted transition-transform', open && 'rotate-180'),
    content: 'w-64 p-1',
    search: cn('flex items-center gap-2 px-2 py-1 mb-1 border-b border-retro-border', surface === 'pixel' && 'border-b-2'),
    input: cn('w-full bg-transparent text-sm text-retro-text outline-none placeholder:text-retro-muted', s.font),
    empty: cn('px-2 py-4 text-center text-xs text-retro-muted', s.font),
    listbox: 'max-h-60 overflow-y-auto',
    heading: cn('px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-retro-muted', s.font),
    label: 'flex-1 truncate',
    check: 'shrink-0 text-retro-muted',
  };
}

export interface ComboboxOptionClassOptions {
  /** The keyboard or the pointer highlights the option. */
  highlighted: boolean;
  disabled: boolean;
}

/** An option of the listbox. */
export function comboboxOptionClasses(surface: Surface, { highlighted, disabled }: ComboboxOptionClassOptions): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-retro-text',
    s.font,
    s.radius,
    highlighted && 'bg-retro-surface/80',
    !highlighted && 'hover:bg-retro-surface/40',
    disabled && 'opacity-50 cursor-not-allowed',
  );
}
