import { describe, expect, it } from 'vitest';
import {
  menubarClasses,
  menubarFocusable,
  menubarHasSubmenu,
  menubarHighlight,
  menubarIds,
  menubarItemClasses,
  menubarKeyAction,
  menubarMenuClasses,
  menubarShortcutClasses,
  menubarSubmenuClasses,
  menubarSubmenuLabel,
  menubarTabStop,
  menubarTriggerClasses,
  type MenubarKeyState,
} from '../../../components/navigation/menubar';

const classesOf = (value: string) => value.split(' ');

// 0 New · 1 separator · 2 Open (disabled) · 3 Recent ▸ · 4 separator · 5 Save
const ITEMS = [{}, { separator: true }, { disabled: true }, { submenu: [{}] }, { separator: true }, {}];

describe('menubar highlight', () => {
  it('skips separators and disabled items', () => {
    expect(ITEMS.map(menubarFocusable)).toEqual([true, false, false, true, false, true]);
  });

  it('moves to the next or previous item, wrapping round', () => {
    expect(menubarHighlight(ITEMS, 0, 1)).toBe(3);
    expect(menubarHighlight(ITEMS, 3, 1)).toBe(5);
    expect(menubarHighlight(ITEMS, 5, 1)).toBe(0);
    expect(menubarHighlight(ITEMS, 0, -1)).toBe(5);
    expect(menubarHighlight(ITEMS, 5, -1)).toBe(3);
  });

  it('starts from the first or the last item when nothing is highlighted', () => {
    expect(menubarHighlight(ITEMS, -1, 1)).toBe(0);
    expect(menubarHighlight(ITEMS, -1, -1)).toBe(5);
  });

  it('jumps to the first or last enabled item', () => {
    const items = [{ disabled: true }, {}, {}, { separator: true }];
    expect(menubarHighlight(items, 2, 'first')).toBe(1);
    expect(menubarHighlight(items, 1, 'last')).toBe(2);
  });

  it('stays put when no other item can take the highlight, and highlights nothing when none can', () => {
    expect(menubarHighlight([{}, { disabled: true }], 0, 1)).toBe(0);
    const inert = [{ separator: true }, { disabled: true }];
    expect(menubarHighlight(inert, -1, 1)).toBe(-1);
    expect(menubarHighlight(inert, -1, 'first')).toBe(-1);
    expect(menubarHighlight(inert, -1, 'last')).toBe(-1);
    expect(menubarHighlight([], -1, -1)).toBe(-1);
  });

  it('opens a submenu only from an item with submenu items', () => {
    expect(menubarHasSubmenu({ submenu: [{}] })).toBe(true);
    expect(menubarHasSubmenu({ submenu: [] })).toBe(false);
    expect(menubarHasSubmenu({})).toBe(false);
    expect(menubarHasSubmenu(undefined)).toBe(false);
  });
});

describe('menubar keys', () => {
  const closed: MenubarKeyState = { open: false, onSubmenuParent: false, submenuOpen: false, inSubmenu: false };
  const open: MenubarKeyState = { ...closed, open: true };
  const onParent: MenubarKeyState = { ...open, onSubmenuParent: true };
  const hovered: MenubarKeyState = { ...onParent, submenuOpen: true };
  const inSubmenu: MenubarKeyState = { ...hovered, inSubmenu: true };

  it('opens a closed menu with the down and up arrows, and switches menus with the left and right ones', () => {
    expect(menubarKeyAction('ArrowDown', closed)).toEqual({ type: 'open', move: 'first' });
    expect(menubarKeyAction('ArrowUp', closed)).toEqual({ type: 'open', move: 'last' });
    expect(menubarKeyAction('ArrowRight', closed)).toEqual({ type: 'switch', step: 1 });
    expect(menubarKeyAction('ArrowLeft', open)).toEqual({ type: 'switch', step: -1 });
  });

  it('leaves Enter, Space, Home, End, Escape and Tab to the buttons of a closed menubar', () => {
    for (const key of ['Enter', ' ', 'Home', 'End', 'Escape', 'Tab', 'a']) expect(menubarKeyAction(key, closed)).toBeUndefined();
  });

  it('moves the highlight in the open menu', () => {
    expect(menubarKeyAction('ArrowDown', open)).toEqual({ type: 'move', level: 'menu', move: 1 });
    expect(menubarKeyAction('ArrowUp', hovered)).toEqual({ type: 'move', level: 'menu', move: -1 });
    expect(menubarKeyAction('Home', open)).toEqual({ type: 'move', level: 'menu', move: 'first' });
    expect(menubarKeyAction('End', open)).toEqual({ type: 'move', level: 'menu', move: 'last' });
  });

  it('enters a submenu with Right, Enter or Space, and leaves it with Left or Escape', () => {
    expect(menubarKeyAction('ArrowRight', onParent)).toEqual({ type: 'enter' });
    expect(menubarKeyAction('ArrowRight', hovered)).toEqual({ type: 'enter' });
    expect(menubarKeyAction('Enter', onParent)).toEqual({ type: 'enter' });
    expect(menubarKeyAction(' ', onParent)).toEqual({ type: 'enter' });
    expect(menubarKeyAction('ArrowLeft', inSubmenu)).toEqual({ type: 'exit' });
    expect(menubarKeyAction('ArrowLeft', hovered)).toEqual({ type: 'exit' });
    expect(menubarKeyAction('Escape', inSubmenu)).toEqual({ type: 'exit' });
  });

  it('moves the highlight in the submenu, and Right switches menus from it', () => {
    expect(menubarKeyAction('ArrowDown', inSubmenu)).toEqual({ type: 'move', level: 'submenu', move: 1 });
    expect(menubarKeyAction('End', inSubmenu)).toEqual({ type: 'move', level: 'submenu', move: 'last' });
    expect(menubarKeyAction('ArrowRight', inSubmenu)).toEqual({ type: 'switch', step: 1 });
  });

  it('activates the highlighted item, closes the menu with Escape and leaves it with Tab', () => {
    expect(menubarKeyAction('Enter', open)).toEqual({ type: 'select' });
    expect(menubarKeyAction(' ', inSubmenu)).toEqual({ type: 'select' });
    expect(menubarKeyAction('Escape', onParent)).toEqual({ type: 'close' });
    expect(menubarKeyAction('Tab', inSubmenu)).toEqual({ type: 'leave' });
    expect(menubarKeyAction('x', open)).toBeUndefined();
  });
});

describe('menubar tab stop', () => {
  it("is the open menu's button, else the last one used, kept inside the menubar", () => {
    expect(menubarTabStop(2, 0, 3)).toBe(2);
    expect(menubarTabStop(null, 2, 3)).toBe(2);
    expect(menubarTabStop(null, 0, 3)).toBe(0);
    // Menus removed since: the last button.
    expect(menubarTabStop(null, 5, 3)).toBe(2);
    expect(menubarTabStop(null, 1, 0)).toBe(0);
  });
});

describe('menubar ids and recipes', () => {
  it('derives every id from the base id', () => {
    const ids = menubarIds('pxl-1');
    expect([ids.trigger(0), ids.menu(1), ids.item(1, 2), ids.subitem(1, 2, 3)]).toEqual([
      'pxl-1-trigger-0',
      'pxl-1-menu-1',
      'pxl-1-item-1-2',
      'pxl-1-item-1-2-3',
    ]);
    expect(menubarSubmenuLabel('Open Recent')).toBe('Open Recent submenu');
  });

  it('frames the menubar and its menus in the surface border and radius', () => {
    expect(classesOf(menubarClasses('pixel'))).toEqual(expect.arrayContaining(['inline-flex', 'border-2', 'pxl-corner-sm']));
    expect(classesOf(menubarMenuClasses('linear'))).toEqual(expect.arrayContaining(['min-w-48', 'border', 'rounded-xl']));
    expect(classesOf(menubarSubmenuClasses('pixel'))).toEqual(expect.arrayContaining(['sm:left-full', 'pxl-corner-md']));
    expect(classesOf(menubarShortcutClasses('linear'))).toEqual(expect.arrayContaining(['text-[10px]', 'rounded-md', 'font-sans']));
  });

  it('tints the button of the open menu', () => {
    expect(classesOf(menubarTriggerClasses('pixel', true))).toContain('bg-retro-surface/80');
    expect(classesOf(menubarTriggerClasses('pixel', false))).not.toContain('bg-retro-surface/80');
  });

  it('rings a focused menu button, keeping an outline for forced-colors mode, which drops the ring', () => {
    const trigger = classesOf(menubarTriggerClasses('linear', false));
    expect(trigger).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:outline-hidden']));
    expect(trigger).not.toContain('outline-none');
  });

  // Regression: a disabled item kept `cursor-pointer`, which Tailwind emits
  // after `cursor-not-allowed`.
  it('tints the highlighted item and dims a disabled one', () => {
    expect(classesOf(menubarItemClasses('pixel', { highlighted: true, disabled: false }))).toEqual(
      expect.arrayContaining(['bg-retro-surface/80', 'cursor-pointer']),
    );
    expect(classesOf(menubarItemClasses('pixel', { highlighted: false, disabled: false }))).toContain('hover:bg-retro-surface/40');
    expect(classesOf(menubarItemClasses('pixel', { highlighted: false, disabled: false, submenu: true }))).toContain(
      'hover:bg-retro-surface/60',
    );
    const disabled = classesOf(menubarItemClasses('linear', { highlighted: true, disabled: true }));
    expect(disabled).toEqual(expect.arrayContaining(['cursor-not-allowed', 'opacity-50']));
    expect(disabled).not.toContain('bg-retro-surface/80');
    expect(disabled).not.toContain('cursor-pointer');
  });
});
