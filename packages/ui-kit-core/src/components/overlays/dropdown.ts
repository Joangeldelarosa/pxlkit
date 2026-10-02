/**
 * PixelDropdown — a button that opens a menu of actions below it. The
 * menu's placement, its class recipes and the keyboard logic every kit
 * shares: the arrows move a highlight that stops at the ends, and typing
 * jumps to an item by its label.
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
    'ml-3 inline-flex items-center gap-0.5 border px-1.5 py-0.5 text-[10px] text-retro-muted',
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

/**
 * The item the arrows move the highlight to among the enabled `values`: the
 * next (`1`) or previous (`-1`) one, staying on the last or first — the first
 * when nothing listed is highlighted.
 */
export function nextDropdownHighlight(values: readonly string[], current: string | null, step: 1 | -1): string | undefined {
  const index = current ? values.indexOf(current) : -1;
  return values[step === 1 ? Math.min(index + 1, values.length - 1) : Math.max(index - 1, 0)];
}

/** Typing starts a new search after this long without a key, in ms. */
export const DROPDOWN_TYPEAHEAD_RESET_MS = 600;

/** Whether a key types a character the typeahead searches for (one visible character). */
export function isTypeaheadKey(key: string): boolean {
  return key.length === 1 && /\S/.test(key);
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
