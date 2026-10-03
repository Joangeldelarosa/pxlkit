/**
 * PixelSplitButton — a primary action joined to a chevron button that opens
 * a menu of related actions. The menu works like PixelDropdown's, with the
 * dropdown's keyboard logic (`dropdownTriggerKeyAction` on the chevron,
 * `dropdownMenuKeyAction` in the open menu); this module holds its recipes.
 */
import { cn, sizeClass, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

/** The root, which the menu is positioned against. */
export const splitButtonRootClasses = 'relative inline-flex';

/** The frame that joins the two buttons. */
export function splitButtonGroupClasses(surface: Surface, tone: Tone): string {
  const s = surfaceClasses(surface);
  return cn('inline-flex overflow-hidden', s.border, s.radius, toneMap[tone].border);
}

/**
 * The primary button, a solid button of the tone without a frame of its own:
 * the group draws the border, so it has no border, radius, shadow or press
 * offset. The group clips both buttons (`overflow-hidden`), so each shows
 * keyboard focus inside its own edge.
 */
export function splitButtonPrimaryClasses(surface: Surface, tone: Tone): string {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return cn(
    'inline-flex items-center justify-center font-medium focus-visible:pxl-focus-inset disabled:opacity-50 disabled:cursor-not-allowed',
    s.font,
    s.transition,
    sizeClass.md,
    t.text,
    t.bg,
    t.hover,
  );
}

/** The chevron button that opens the menu. */
export function splitButtonToggleClasses(surface: Surface, tone: Tone): string {
  const t = toneMap[tone];
  return cn(
    'flex items-center border-0 border-l px-2 focus-visible:pxl-focus-inset disabled:opacity-50 disabled:cursor-not-allowed',
    surfaceClasses(surface).transition,
    t.border,
    t.bg,
    t.hover,
    t.text,
  );
}

/** Accessible name of the chevron button, which names the menu too. */
export const SPLIT_BUTTON_TOGGLE_LABEL = 'More options';

/** The menu, below the root and aligned with its left edge, or its right one. */
export function splitButtonMenuClasses(surface: Surface, alignRight: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'absolute top-full z-40 mt-1 min-w-40 max-w-[calc(100vw-1rem)] bg-retro-bg p-1 shadow-xl',
    alignRight ? 'right-0' : 'left-0',
    s.border,
    s.radiusLg,
    'border-retro-border-strong',
  );
}

/** An option of the menu. */
export function splitButtonItemClasses(surface: Surface, highlighted: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex w-full items-center text-left text-xs break-words px-3 py-2 text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text',
    highlighted && 'bg-retro-surface text-retro-text',
    s.font,
    s.radius,
  );
}

/** Width the menu needs right of the root's left edge: its 160 px minimum and a margin. */
export const SPLIT_BUTTON_MENU_ROOM = 168;

/** Whether the menu opens from the root's right edge, because it would overflow the viewport from its left one. */
export function splitButtonMenuAlignsRight(rootLeft: number, viewportWidth: number): boolean {
  return rootLeft + SPLIT_BUTTON_MENU_ROOM > viewportWidth;
}

/** Element id of the option at `index` of a menu, which the menu's `aria-activedescendant` points at. */
export function splitButtonItemId(menuId: string, index: number): string {
  return `${menuId}-${index}`;
}
