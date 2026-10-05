/**
 * PixelDropdown — a button that opens a menu of actions below it. The
 * menu's placement, its class recipes, the roles of its items and the
 * keyboard logic every kit shares: focus moves into the open menu, whose
 * `aria-activedescendant` follows a highlight that the arrows move and that
 * stops at the ends, and typing jumps to an item by its label.
 */
import { offset, shift, type Middleware, type Placement } from '@floating-ui/dom';
import { cn, surfaceClasses, type Surface, type Tone } from '../../common';

/** What a row of the `items` shorthand is. `submenu` draws an arrow; it does not nest. */
export type DropdownItemKind = 'item' | 'separator' | 'header' | 'submenu' | 'checkbox' | 'radio';

/** The menu opens below the trigger, aligned with its start edge. */
export const DROPDOWN_PLACEMENT: Placement = 'bottom-start';

/** 6 px below the trigger, shifted to stay 8 px inside the viewport; it does not flip. */
export function dropdownMiddleware(): Middleware[] {
  return [offset(6), shift({ padding: 8 })];
}

/** The root that holds the trigger and the menu, which is anchored to it. */
export const dropdownRootClasses = 'relative inline-block';

/** The trigger's chevron, turned over while the menu is open. */
export function dropdownChevronClasses(open: boolean): string {
  return cn('transition-transform', open && 'rotate-180');
}

/** The menu panel. */
export function dropdownContentClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn('z-40 min-w-44 max-w-[calc(100vw-1rem)] bg-retro-bg p-1 shadow-xl', s.border, s.radiusLg, 'border-retro-border');
}

/** Text colour of an item per tone; `neutral` keeps the default. */
export const dropdownToneTextClasses: Partial<Record<Tone, string>> = {
  red: 'text-retro-red',
  green: 'text-retro-green',
  cyan: 'text-retro-cyan',
  gold: 'text-retro-gold',
  purple: 'text-retro-purple',
  pink: 'text-retro-pink',
};

export interface DropdownItemState {
  highlighted: boolean;
  disabled: boolean;
  tone?: Tone;
}

/** An item of the menu. */
export function dropdownItemClasses(surface: Surface, { highlighted, disabled, tone }: DropdownItemState): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex w-full items-center px-3 py-2 text-left text-xs text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text',
    highlighted && 'bg-retro-surface text-retro-text',
    disabled && 'cursor-not-allowed opacity-50',
    tone && dropdownToneTextClasses[tone],
    s.font,
    s.radius,
  );
}

/** The icon before an item's label. */
export const dropdownItemIconClasses = 'mr-2 inline-flex items-center justify-center opacity-80 shrink-0';

/** An item's label. */
export const dropdownItemLabelClasses = 'flex-1 truncate';

/** The keyboard hint at the end of an item. */
export function dropdownShortcutClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'ml-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-retro-muted',
    s.border,
    s.radius,
    'border-retro-border',
    s.font,
  );
}

export const dropdownSeparatorClasses = 'my-1 h-px bg-retro-border/60';

/** A group label between items. */
export const dropdownHeaderClasses = 'px-3 pt-2 pb-1 text-[10px] font-pixel uppercase tracking-wider text-retro-muted/70';

/** The check or dot drawn in place of the icon of a checkbox or radio item. */
export const dropdownMarkClasses = 'inline-block w-3 text-center';

/** The mark of a checkbox (✓) or radio (●) item; empty while unchecked. */
export function dropdownMark(kind: 'checkbox' | 'radio', checked: boolean | undefined): string {
  if (!checked) return '';
  return kind === 'checkbox' ? '✓' : '●';
}

/** The role of a plain item, and of the checkbox and radio items, which also carry `aria-checked`. */
export const dropdownItemRoles = {
  item: 'menuitem',
  checkbox: 'menuitemcheckbox',
  radio: 'menuitemradio',
} as const;

/** The first or the last enabled item. */
export type DropdownEdge = 'first' | 'last';

/** Where a key moves the highlight: to the next or previous item, or to the first or last one. */
export type DropdownMove = 1 | -1 | DropdownEdge;

/**
 * The item a move highlights among the enabled `values`: the next (`1`) or
 * previous (`-1`) one, staying on the last or first — the first when nothing
 * listed is highlighted — or the first or last one.
 */
export function nextDropdownHighlight(values: readonly string[], current: string | null, move: DropdownMove): string | undefined {
  if (move === 'first') return values[0];
  if (move === 'last') return values[values.length - 1];
  const index = current ? values.indexOf(current) : -1;
  return values[move === 1 ? Math.min(index + 1, values.length - 1) : Math.max(index - 1, 0)];
}

/** Typing starts a new search after this long without a key, in ms. */
export const DROPDOWN_TYPEAHEAD_RESET_MS = 600;

/** Whether a key types a character the typeahead searches for (one visible character). */
export function isTypeaheadKey(key: string): boolean {
  return key.length === 1 && /\S/.test(key);
}

/**
 * Where an arrow key on the trigger opens the menu: ArrowDown on its first
 * enabled item, ArrowUp on its last, as the WAI-ARIA menu button pattern
 * has it. `undefined` for any other key.
 */
export function dropdownTriggerKeyAction(key: string): DropdownEdge | undefined {
  if (key === 'ArrowDown') return 'first';
  if (key === 'ArrowUp') return 'last';
  return undefined;
}

/** What a key pressed in the open menu does. */
export type DropdownMenuKeyAction = DropdownMove | 'select' | 'leave' | 'typeahead';

/**
 * What a key pressed in the open menu does: the arrows, Home and End move the
 * highlight, Enter and Space choose the highlighted item, Tab leaves the menu
 * and a visible character types ahead. `undefined` for any other key.
 */
export function dropdownMenuKeyAction(key: string): DropdownMenuKeyAction | undefined {
  switch (key) {
    case 'ArrowDown':
      return 1;
    case 'ArrowUp':
      return -1;
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    case 'Enter':
    case ' ':
      return 'select';
    case 'Tab':
      return 'leave';
    default:
      return isTypeaheadKey(key) ? 'typeahead' : undefined;
  }
}

/**
 * The item typing jumps to among the enabled `values`: the first whose label
 * starts with the typed text, else the first whose label contains it, in any
 * case. Items without a label are skipped.
 */
export function dropdownTypeaheadMatch(
  values: readonly string[],
  labelOf: (value: string) => string | undefined,
  typed: string,
): string | undefined {
  const query = typed.toLowerCase();
  const label = (value: string) => (labelOf(value) || '').toLowerCase();
  return values.find((value) => label(value).startsWith(query)) ?? values.find((value) => label(value).includes(query));
}
