/**
 * PixelMenubar — an application menubar (`role="menubar"`): a row of menu
 * buttons, each opening a menu (`role="menu"`) of actions with an optional
 * icon and shortcut hint, separators, disabled items and items with a
 * submenu. The open menu takes focus and points `aria-activedescendant` at
 * a highlight that the arrow keys move round its enabled items, into and out
 * of a submenu; Left and Right switch menus. Escape closes the submenu, then
 * the menu, with focus back on its button.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** An item of a menu, as far as the highlight is concerned. */
export interface MenubarEntry {
  separator?: boolean;
  disabled?: boolean;
  submenu?: readonly unknown[];
}

/** Separators and disabled items cannot take the highlight. */
export function menubarFocusable(item: MenubarEntry): boolean {
  return !item.separator && !item.disabled;
}

/** Whether an item opens a submenu. */
export function menubarHasSubmenu(item: MenubarEntry | undefined): boolean {
  return !!item?.submenu && item.submenu.length > 0;
}

/** Where a key moves the highlight. */
export type MenubarMove = 1 | -1 | 'first' | 'last';

/**
 * The item a move highlights among `items`, skipping separators and disabled
 * items: the next (`1`) or previous (`-1`) one, wrapping round — from before
 * the first or after the last when nothing is highlighted (`current` is -1)
 * — or the first or last one. When no other item can take it, the highlight
 * stays where it is; -1 when nothing can be highlighted.
 */
export function menubarHighlight(items: readonly MenubarEntry[], current: number, move: MenubarMove): number {
  const count = items.length;
  if (move === 'first' || move === 'last') {
    for (let i = 0; i < count; i++) {
      const index = move === 'first' ? i : count - 1 - i;
      if (menubarFocusable(items[index]!)) return index;
    }
    return -1;
  }
  let index = current < 0 ? (move === 1 ? -1 : count) : current;
  for (let step = 0; step < count; step++) {
    index = (index + move + count) % count;
    if (menubarFocusable(items[index]!)) return index;
  }
  return current;
}

/** Where the highlight is, as far as the keys are concerned. */
export interface MenubarKeyState {
  /** A menu is open. */
  open: boolean;
  /** The highlighted item of the open menu has a submenu. */
  onSubmenuParent: boolean;
  /** A submenu is open. */
  submenuOpen: boolean;
  /** The highlight is on an item of the open submenu. */
  inSubmenu: boolean;
}

/** What a key does in a menubar. */
export type MenubarKeyAction =
  /** Open the next or previous menu, wrapping round — from the focused button while every menu is closed. */
  | { type: 'switch'; step: 1 | -1 }
  /** Open the focused button's menu on its first or last item. */
  | { type: 'open'; move: 'first' | 'last' }
  /** Move the highlight in the open menu (closing its submenu) or in the open submenu. */
  | { type: 'move'; level: 'menu' | 'submenu'; move: MenubarMove }
  /** Open the highlighted item's submenu on its first item. */
  | { type: 'enter' }
  /** Close the submenu; the highlight goes back to its item. */
  | { type: 'exit' }
  /** Activate the highlighted item. */
  | { type: 'select' }
  /** Close the menu, with focus back on its button. */
  | { type: 'close' }
  /** Close the menu with focus back on its button, before the browser's Tab moves on from there. */
  | { type: 'leave' };

/**
 * What a key does, following the WAI-ARIA menubar pattern: Left and Right
 * switch menus (Right enters the submenu of the highlighted item, Left leaves
 * an open submenu), Down and Up open a closed menu on its first or last item
 * and move the highlight in an open one, Home and End jump to the ends,
 * Enter and Space activate the highlighted item or enter its submenu, Escape
 * closes the submenu and then the menu, and Tab leaves. `undefined` for any
 * other key, and for the keys a closed menubar leaves to its buttons.
 */
export function menubarKeyAction(key: string, state: MenubarKeyState): MenubarKeyAction | undefined {
  const { open, onSubmenuParent, submenuOpen, inSubmenu } = state;
  const level = inSubmenu ? 'submenu' : 'menu';
  switch (key) {
    case 'ArrowRight':
      return open && onSubmenuParent && !inSubmenu ? { type: 'enter' } : { type: 'switch', step: 1 };
    case 'ArrowLeft':
      return submenuOpen ? { type: 'exit' } : { type: 'switch', step: -1 };
    case 'ArrowDown':
    case 'ArrowUp': {
      const down = key === 'ArrowDown';
      if (!open) return { type: 'open', move: down ? 'first' : 'last' };
      return { type: 'move', level, move: down ? 1 : -1 };
    }
    case 'Home':
    case 'End':
      return open ? { type: 'move', level, move: key === 'Home' ? 'first' : 'last' } : undefined;
    case 'Enter':
    case ' ':
      if (!open) return undefined;
      return onSubmenuParent && !inSubmenu ? { type: 'enter' } : { type: 'select' };
    case 'Escape':
      if (submenuOpen) return { type: 'exit' };
      return open ? { type: 'close' } : undefined;
    case 'Tab':
      return open ? { type: 'leave' } : undefined;
    default:
      return undefined;
  }
}

/**
 * The menu button that holds the menubar's single tab stop: the open menu's,
 * or else the one that last had focus or a menu open (`last`), kept inside
 * the `count` buttons. Tab and Shift+Tab out of a menu then leave the menubar
 * from its button — with the stop back on the first button, Shift+Tab would
 * land there instead — and coming back returns to it.
 */
export function menubarTabStop(openMenu: number | null, last: number, count: number): number {
  if (openMenu !== null) return openMenu;
  return Math.max(0, Math.min(last, count - 1));
}

/** Ids of the parts of a menubar, from its generated base id. */
export function menubarIds(baseId: string) {
  return {
    trigger: (menu: number) => `${baseId}-trigger-${menu}`,
    menu: (menu: number) => `${baseId}-menu-${menu}`,
    item: (menu: number, item: number) => `${baseId}-item-${menu}-${item}`,
    subitem: (menu: number, item: number, subitem: number) => `${baseId}-item-${menu}-${item}-${subitem}`,
  };
}

/** The accessible name of an item's submenu. */
export function menubarSubmenuLabel(label: string): string {
  return `${label} submenu`;
}

/** The arrow at the end of an item with a submenu, hidden from assistive technology. */
export const MENUBAR_SUBMENU_ARROW = '▸';

/** The menubar. */
export function menubarClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn('relative inline-flex items-center gap-0.5 p-1', s.border, s.radius, 'border-retro-border bg-retro-bg');
}

/** Holds a menu button and its menu; on small screens the menu is placed against the menubar. */
export const menubarTriggerSlotClasses = 'relative max-sm:static';

/** A menu button, tinted while its menu is open. */
export function menubarTriggerClasses(surface: Surface, open: boolean): string {
  const s = surfaceClasses(surface);
  return cn(
    'px-3 py-1.5 text-xs text-retro-text focus-visible:outline-hidden',
    s.font,
    s.radius,
    'hover:bg-retro-surface/60',
    'focus-visible:ring-2 focus-visible:ring-retro-border/60',
    open && 'bg-retro-surface/80',
  );
}

/** A menu, below its button. */
export function menubarMenuClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'absolute left-0 top-full z-50 mt-1 min-w-48 bg-retro-bg p-1 shadow-xl max-sm:left-1 max-sm:right-1',
    s.border,
    s.radiusLg,
    'border-retro-border',
  );
}

/** A submenu, beside its item from the `sm` breakpoint and below it before. */
export function menubarSubmenuClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'absolute left-0 top-full z-50 mt-1 min-w-44 max-w-[calc(100vw-2rem)] bg-retro-bg p-1 shadow-xl sm:left-full sm:top-0 sm:ml-1 sm:mt-0 sm:max-w-none',
    s.border,
    s.radiusLg,
    'border-retro-border',
  );
}

/** A separator between items. */
export const menubarSeparatorClasses = 'my-1 h-px bg-retro-border/60';

/** Holds an item and its submenu. */
export const menubarItemSlotClasses = 'relative';

export interface MenubarItemState {
  highlighted: boolean;
  disabled: boolean;
  /** An item of a submenu, which hovers a shade darker. */
  submenu?: boolean;
}

/** An item of a menu or submenu; the highlighted one is tinted. */
export function menubarItemClasses(surface: Surface, { highlighted, disabled, submenu = false }: MenubarItemState): string {
  const s = surfaceClasses(surface);
  return cn(
    'flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-xs text-retro-text',
    s.font,
    s.radius,
    highlighted && !disabled && 'bg-retro-surface/80',
    !highlighted && !disabled && (submenu ? 'hover:bg-retro-surface/60' : 'hover:bg-retro-surface/40'),
    disabled && 'cursor-not-allowed opacity-50',
  );
}

/** The icon of an item. */
export const menubarItemIconClasses = 'inline-flex h-4 w-4 shrink-0 items-center justify-center text-retro-muted';

/** The label of an item. */
export const menubarItemLabelClasses = 'flex-1 truncate';

/** The arrow of an item with a submenu. */
export const menubarSubmenuArrowClasses = 'text-retro-muted';

/** The keyboard hint at the end of an item. */
export function menubarShortcutClasses(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn(
    'ml-2 inline-flex items-center gap-0.5 border px-1.5 py-0.5 text-[10px] text-retro-muted',
    s.border,
    s.radius,
    'border-retro-border',
    s.font,
  );
}
