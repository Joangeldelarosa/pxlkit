import { describe, expect, it } from 'vitest';
import {
  navigationMenuClasses,
  navigationMenuFocusIndex,
  navigationMenuIds,
  navigationMenuKeyAction,
  navigationMenuListClasses,
  navigationMenuPanelClasses,
  navigationMenuTriggerClasses,
  navigationMenuViewportClasses,
} from '../../../components/navigation/navigation-menu';

const classesOf = (value: string) => value.split(' ');

describe('navigation menu keyboard', () => {
  it('moves along the orientation, jumps with Home and End, closes with Escape and activates with Enter or Space', () => {
    expect(['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].map((key) => navigationMenuKeyAction(key, 'horizontal'))).toEqual([
      1,
      -1,
      undefined,
      undefined,
    ]);
    expect(['ArrowDown', 'ArrowUp', 'ArrowLeft'].map((key) => navigationMenuKeyAction(key, 'vertical'))).toEqual([1, -1, undefined]);
    expect(['Home', 'End', 'Escape', 'Enter', ' ', 'Tab'].map((key) => navigationMenuKeyAction(key, 'vertical'))).toEqual([
      'first',
      'last',
      'close',
      'activate',
      'activate',
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

  it('derives the item and panel ids from the base id and the index', () => {
    expect(navigationMenuIds('pxl-1', 2)).toEqual({ trigger: 'pxl-1-trigger-2', panel: 'pxl-1-panel-2' });
  });
});

describe('navigation menu recipes', () => {
  it('sets the menu in the surface font and lays the items out along the orientation', () => {
    expect(classesOf(navigationMenuClasses('linear'))).toEqual(expect.arrayContaining(['relative', 'font-sans']));
    expect(classesOf(navigationMenuListClasses('horizontal'))).toEqual(expect.arrayContaining(['flex-row', 'list-none']));
    expect(classesOf(navigationMenuListClasses('vertical'))).toContain('flex-col');
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
