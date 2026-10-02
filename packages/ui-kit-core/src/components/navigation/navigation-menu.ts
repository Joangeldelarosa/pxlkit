/**
 * PixelNavigationMenu — a `<nav>` landmark of links and disclosure buttons,
 * in a row or a column, after the WAI-ARIA disclosure navigation pattern: a
 * button shows or hides a panel of content that follows it inside its list
 * item, so Tab moves from the button into the open panel. The panel sits
 * under its item, or below the whole list (the viewport). A click — or Enter
 * and Space, which the browser turns into one — toggles a panel; a mouse
 * pointing at an item opens its panel, which closes again once the pointer
 * leaves the menu, unless a click kept it open. The arrow keys of the
 * orientation move focus round the items, Home and End jump to the ends,
 * ArrowDown on the open button of a row moves into its panel, and Escape
 * closes the panel, keeping focus on its button.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { getFocusableElements } from '../../dom/focus-trap';

export type NavigationMenuOrientation = 'horizontal' | 'vertical';

/** Id of an item's panel, from the menu's generated base id. */
export function navigationMenuPanelId(baseId: string, index: number): string {
  return `${baseId}-panel-${index}`;
}

/* ── Opening ────────────────────────────────────────────────────────────── */

/** The open panel: its item, and whether the pointer opened it. */
export interface NavigationMenuOpen {
  index: number;
  /** Opened by a mouse pointing at the item: it closes as the pointer leaves the menu. */
  hover: boolean;
}

/**
 * The open panel once a pointer enters item `index`: a mouse opens the
 * item's panel — or closes the one it opened, at an item without a panel —
 * and leaves a panel a click opened alone. Touch and pen pointers change
 * nothing: their tap ends in a click.
 */
export function navigationMenuPointerEnter(
  open: NavigationMenuOpen | null,
  index: number,
  hasPanel: boolean,
  pointerType: string,
): NavigationMenuOpen | null {
  if (pointerType !== 'mouse' || (open && !open.hover)) return open;
  if (!hasPanel) return null;
  return open?.index === index ? open : { index, hover: true };
}

/**
 * The open panel after a click on item `index`, which has one: the click
 * opens it, keeps it open when the pointer opened it (the next click closes
 * it), and closes it when a click opened it.
 */
export function navigationMenuClick(open: NavigationMenuOpen | null, index: number): NavigationMenuOpen | null {
  return open?.index === index && !open.hover ? null : { index, hover: false };
}

/** The open panel once the pointer leaves the menu: closed when the pointer opened it. */
export function navigationMenuPointerLeave(open: NavigationMenuOpen | null): NavigationMenuOpen | null {
  return open?.hover ? null : open;
}

/* ── Keyboard and focus ─────────────────────────────────────────────────── */

/** Where a key moves focus among the items. */
export type NavigationMenuMove = 1 | -1 | 'first' | 'last';

/** What a key pressed on an item does. */
export type NavigationMenuKeyAction = NavigationMenuMove | 'close' | 'panel';

/**
 * What a key pressed on an item does: the arrows of the orientation and Home
 * / End move focus, Escape closes the open panel, and ArrowDown on a row
 * moves into the item's open panel. `undefined` for any other key: Enter and
 * Space are the browser's, which activates the link or button.
 */
export function navigationMenuKeyAction(
  key: string,
  orientation: NavigationMenuOrientation,
): NavigationMenuKeyAction | undefined {
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
    default:
      return horizontal && key === 'ArrowDown' ? 'panel' : undefined;
  }
}

/** The item a move from item `index` of `count` focuses; the arrows wrap round. */
export function navigationMenuFocusIndex(index: number, move: NavigationMenuMove, count: number): number {
  if (move === 'first') return 0;
  if (move === 'last') return count - 1;
  return (index + move + count) % count;
}

/** The first element taking focus in the open panel that `button` controls, if any. */
export function navigationMenuPanelEntry(button: HTMLElement): HTMLElement | undefined {
  const id = button.getAttribute('aria-controls');
  const panel = id ? button.ownerDocument.getElementById(id) : null;
  return panel ? getFocusableElements(panel)[0] : undefined;
}

/**
 * Call before the panel of the item `trigger` closes: focus inside the panel
 * moves to the item's button, rather than fall to `<body>` with the panel.
 */
export function returnNavigationMenuFocus(trigger: HTMLElement | null | undefined): void {
  const active = trigger?.ownerDocument.activeElement;
  if (trigger && active && active !== trigger && trigger.parentElement?.contains(active)) trigger.focus();
}

/* ── Recipes ────────────────────────────────────────────────────────────── */

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

/**
 * An item's `<li>`, which holds its panel and anchors it — except with the
 * shared viewport, which is placed against the `<nav>`, below the whole list.
 */
export function navigationMenuItemClasses(viewport: boolean): string {
  return cn(!viewport && 'relative', 'list-none min-w-0');
}

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
