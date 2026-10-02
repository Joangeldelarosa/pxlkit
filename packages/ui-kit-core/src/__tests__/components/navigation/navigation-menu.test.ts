import { afterEach, describe, expect, it } from 'vitest';
import {
  navigationMenuClasses,
  navigationMenuClick,
  navigationMenuFocusIndex,
  navigationMenuItemClasses,
  navigationMenuKeyAction,
  navigationMenuListClasses,
  navigationMenuPanelClasses,
  navigationMenuPanelEntry,
  navigationMenuPanelId,
  navigationMenuPointerEnter,
  navigationMenuPointerLeave,
  navigationMenuTriggerClasses,
  navigationMenuViewportClasses,
  returnNavigationMenuFocus,
} from '../../../components/navigation/navigation-menu';

const classesOf = (value: string) => value.split(' ');

describe('navigation menu opening', () => {
  const hovered = { index: 1, hover: true };
  const clicked = { index: 1, hover: false };

  it('opens the panel a mouse points at, and closes it at an item without one', () => {
    expect(navigationMenuPointerEnter(null, 1, true, 'mouse')).toEqual(hovered);
    expect(navigationMenuPointerEnter(hovered, 1, true, 'mouse')).toBe(hovered);
    expect(navigationMenuPointerEnter(hovered, 2, true, 'mouse')).toEqual({ index: 2, hover: true });
    expect(navigationMenuPointerEnter(hovered, 0, false, 'mouse')).toBeNull();
    expect(navigationMenuPointerEnter(null, 0, false, 'mouse')).toBeNull();
  });

  it('opens nothing for touch and pen pointers, whose tap ends in a click', () => {
    expect(navigationMenuPointerEnter(null, 1, true, 'touch')).toBeNull();
    expect(navigationMenuPointerEnter(hovered, 0, false, 'pen')).toBe(hovered);
  });

  it('leaves a panel a click opened to clicks and Escape', () => {
    expect(navigationMenuPointerEnter(clicked, 2, true, 'mouse')).toBe(clicked);
    expect(navigationMenuPointerEnter(clicked, 0, false, 'mouse')).toBe(clicked);
    expect(navigationMenuPointerLeave(clicked)).toBe(clicked);
    expect(navigationMenuPointerLeave(hovered)).toBeNull();
    expect(navigationMenuPointerLeave(null)).toBeNull();
  });

  it('toggles a panel with a click, keeping open the one the pointer opened until the next click', () => {
    expect(navigationMenuClick(null, 1)).toEqual(clicked);
    expect(navigationMenuClick(hovered, 1)).toEqual(clicked);
    expect(navigationMenuClick(clicked, 1)).toBeNull();
    expect(navigationMenuClick(clicked, 2)).toEqual({ index: 2, hover: false });
  });

  it('derives the panel id from the base id and the index', () => {
    expect(navigationMenuPanelId('pxl-1', 2)).toBe('pxl-1-panel-2');
  });
});

describe('navigation menu keyboard', () => {
  it('moves along the orientation, jumps with Home and End, closes with Escape and enters a row item panel with ArrowDown', () => {
    expect(['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].map((key) => navigationMenuKeyAction(key, 'horizontal'))).toEqual([
      1,
      -1,
      'panel',
      undefined,
    ]);
    expect(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].map((key) => navigationMenuKeyAction(key, 'vertical'))).toEqual([
      1,
      -1,
      undefined,
      undefined,
    ]);
    expect(['Home', 'End', 'Escape', 'Enter', ' ', 'Tab'].map((key) => navigationMenuKeyAction(key, 'vertical'))).toEqual([
      'first',
      'last',
      'close',
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('wraps round the items with the arrows', () => {
    expect(navigationMenuFocusIndex(1, 1, 4)).toBe(2);
    expect(navigationMenuFocusIndex(3, 1, 4)).toBe(0);
    expect(navigationMenuFocusIndex(0, -1, 4)).toBe(3);
    expect(navigationMenuFocusIndex(2, 'first', 4)).toBe(0);
    expect(navigationMenuFocusIndex(0, 'last', 4)).toBe(3);
  });
});

describe('navigation menu focus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  function item() {
    document.body.innerHTML = `
      <ul>
        <li>
          <button type="button" id="trigger" aria-controls="panel">Products</button>
          <div id="panel"><p>Intro</p><a href="#a" id="first">A</a><a href="#b">B</a></div>
        </li>
        <li><a href="#docs" id="docs">Docs</a></li>
      </ul>
    `;
    const $ = (id: string) => document.getElementById(id)!;
    return { trigger: $('trigger'), first: $('first'), docs: $('docs'), panel: $('panel') };
  }

  it('finds the first element taking focus in the open panel a button controls', () => {
    const { trigger, first, docs, panel } = item();
    expect(navigationMenuPanelEntry(trigger)).toBe(first);
    expect(navigationMenuPanelEntry(docs)).toBeUndefined();
    panel.remove();
    expect(navigationMenuPanelEntry(trigger)).toBeUndefined();
  });

  it('hands focus inside a closing panel back to its button, and leaves focus elsewhere alone', () => {
    const { trigger, first, docs } = item();
    first.focus();
    returnNavigationMenuFocus(trigger);
    expect(document.activeElement).toBe(trigger);
    returnNavigationMenuFocus(trigger);
    expect(document.activeElement).toBe(trigger);
    docs.focus();
    returnNavigationMenuFocus(trigger);
    expect(document.activeElement).toBe(docs);
    returnNavigationMenuFocus(null);
    expect(document.activeElement).toBe(docs);
  });
});

describe('navigation menu recipes', () => {
  it('sets the menu in the surface font and lays the items out along the orientation', () => {
    expect(classesOf(navigationMenuClasses('linear'))).toEqual(expect.arrayContaining(['relative', 'font-sans']));
    expect(classesOf(navigationMenuListClasses('horizontal'))).toEqual(expect.arrayContaining(['flex-row', 'list-none']));
    expect(classesOf(navigationMenuListClasses('vertical'))).toContain('flex-col');
  });

  it('anchors a panel on its own item, and the shared viewport on the menu', () => {
    expect(classesOf(navigationMenuItemClasses(false))).toEqual(['relative', 'list-none', 'min-w-0']);
    expect(classesOf(navigationMenuItemClasses(true))).toEqual(['list-none', 'min-w-0']);
  });

  it('tints the item whose panel is open', () => {
    expect(classesOf(navigationMenuTriggerClasses('pixel', true))).toEqual(
      expect.arrayContaining(['bg-retro-surface/60', 'pxl-corner-sm', 'focus-visible:ring-retro-cyan/40']),
    );
    expect(classesOf(navigationMenuTriggerClasses('pixel', false))).not.toContain('bg-retro-surface/60');
  });

  it('frames the panels and places the shared one beside a vertical list', () => {
    expect(classesOf(navigationMenuPanelClasses('linear'))).toEqual(expect.arrayContaining(['p-3', 'border', 'rounded-xl']));
    expect(classesOf(navigationMenuViewportClasses('pixel', 'horizontal'))).not.toContain('sm:left-full');
    expect(classesOf(navigationMenuViewportClasses('pixel', 'vertical'))).toEqual(
      expect.arrayContaining(['sm:left-full', 'p-4', 'pxl-corner-md']),
    );
  });
});
