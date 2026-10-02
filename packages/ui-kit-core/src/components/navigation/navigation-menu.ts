/**
 * PixelNavigationMenu — a `<nav>` landmark whose items (links or buttons, in
 * a row or a column) can open a panel of content: one shared panel below the
 * list (the viewport), or a panel under each item. Pointing at or focusing
 * an item with content opens its panel; the arrow keys of the orientation
 * move focus round the items, Home and End jump to the ends, Escape closes
 * the panel, and Enter or Space toggles it (a link with an `href` follows
 * it instead).
 */
import { cn, surfaceClasses, type Surface } from '../../common';

export type NavigationMenuOrientation = 'horizontal' | 'vertical';

/** Ids of an item and of its panel, from the menu's generated base id. */
export function navigationMenuIds(baseId: string, index: number): { trigger: string; panel: string } {
  return { trigger: `${baseId}-trigger-${index}`, panel: `${baseId}-panel-${index}` };
}

/** Where a key moves focus among the items. */
export type NavigationMenuMove = 1 | -1 | 'first' | 'last';

/**
 * What a key pressed on an item does: the arrows of the orientation and Home
 * / End move focus, Escape closes the open panel, Enter and Space activate
 * the item. `undefined` for any other key.
 */
export function navigationMenuKeyAction(
  key: string,
  orientation: NavigationMenuOrientation,
): NavigationMenuMove | 'close' | 'activate' | undefined {
  const horizontal = orientation === 'horizontal';
  switch (key) {
    case horizontal ? 'ArrowRight' : 'ArrowDown':
      return 1;
    case horizontal ? 'ArrowLeft' : 'ArrowUp':
      return -1;
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    case 'Escape':
      return 'close';
    case 'Enter':
    case ' ':
      return 'activate';
    default:
      return undefined;
  }
}

/** The item a move from item `index` of `count` focuses; the arrows wrap round. */
export function navigationMenuFocusIndex(index: number, move: NavigationMenuMove, count: number): number {
  if (move === 'first') return 0;
  if (move === 'last') return count - 1;
  return (index + move + count) % count;
}

/** The `<nav>`. */
export function navigationMenuClasses(surface: Surface): string {
  return cn('relative inline-block max-w-full', surfaceClasses(surface).font);
}

/** The list of items, a row or a column. */
export function navigationMenuListClasses(orientation: NavigationMenuOrientation): string {
  return cn(
    orientation === 'horizontal' ? 'flex flex-row items-stretch gap-1' : 'flex flex-col items-stretch gap-1',
    'list-none p-0 m-0',
  );
}

/** An item's `<li>`, which also anchors its own panel. */
export const navigationMenuItemClasses = 'relative list-none min-w-0';

/** An item's link or button, tinted while its panel is open. */
export function navigationMenuTriggerClasses(surface: Surface, expanded: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'inline-flex max-w-full items-center gap-2 px-3 py-2 text-sm text-retro-text outline-none',
    'cursor-pointer select-none',
    s.font,
    s.radius,
    'hover:bg-retro-surface/40',
    'focus-visible:ring-2 focus-visible:ring-retro-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
    expanded && 'bg-retro-surface/60',
  );
}

/** An item's icon, hidden from assistive technology. */
export const navigationMenuIconClasses = 'inline-flex h-4 w-4 shrink-0 items-center justify-center text-retro-muted';

/** An item's label. */
export const navigationMenuLabelClasses = 'truncate';

/** The panel under its own item. */
export function navigationMenuPanelClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'absolute left-0 top-full z-50 mt-2 min-w-[min(16rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-retro-bg p-3 shadow-xl',
    s.border,
    s.radiusLg,
    'border-retro-border',
  );
}

/** The shared panel: below the list, or beside a vertical list from the `sm` breakpoint. */
export function navigationMenuViewportClasses(surface: Surface, orientation: NavigationMenuOrientation): string {
  const s = surfaceClasses(surface);
  return cn(
    orientation === 'horizontal'
      ? 'absolute left-0 top-full mt-2'
      : 'absolute left-0 top-full mt-2 sm:left-full sm:top-0 sm:ml-2 sm:mt-0',
    'z-50 min-w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] bg-retro-bg p-4 shadow-xl',
    s.border,
    s.radiusLg,
    'border-retro-border',
  );
}
