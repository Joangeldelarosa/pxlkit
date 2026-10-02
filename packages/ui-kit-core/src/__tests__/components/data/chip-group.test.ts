import { describe, expect, it } from 'vitest';
import {
  chipGroupClasses,
  chipGroupItemClasses,
  chipGroupKeyAction,
  chipGroupMove,
  chipGroupRole,
  chipGroupTabStop,
  toggleChipSelection,
} from '../../../components/data/chip-group';

const VALUES = ['a', 'b', 'c'];
const classesOf = (value: string) => value.split(' ');

describe('chip group recipes', () => {
  it('lays the chips out in a wrapping row', () => {
    expect(classesOf(chipGroupClasses)).toEqual(expect.arrayContaining(['inline-flex', 'flex-wrap', 'gap-1.5']));
  });

  it('resets the toggle button, rounds it per surface and rings it while selected', () => {
    const pixel = classesOf(chipGroupItemClasses('pixel', false));
    expect(pixel).toEqual(expect.arrayContaining(['bg-transparent', 'border-0', 'p-0', 'pxl-corner-sm']));
    expect(pixel).not.toContain('ring-2');
    expect(classesOf(chipGroupItemClasses('linear', true))).toEqual(expect.arrayContaining(['rounded-md', 'ring-2', 'ring-retro-cyan/60']));
  });

  it('is a radio group for single selection and a group only when named for multiple', () => {
    expect(chipGroupRole(false, false)).toBe('radiogroup');
    expect(chipGroupRole(false, true)).toBe('radiogroup');
    expect(chipGroupRole(true, true)).toBe('group');
    expect(chipGroupRole(true, false)).toBeUndefined();
  });

  it('toggles a chip in and out of a multiple selection, keeping the order', () => {
    expect(toggleChipSelection([], 'a', true)).toEqual(['a']);
    expect(toggleChipSelection(['a'], 'b', true)).toEqual(['a', 'b']);
    expect(toggleChipSelection(['a', 'b'], 'a', true)).toEqual(['b']);
  });

  it('selects one chip at a time in single selection, and clears it when toggled again', () => {
    expect(toggleChipSelection(['a'], 'b', false)).toEqual(['b']);
    expect(toggleChipSelection(['b'], 'b', false)).toEqual([]);
  });

  it('maps Enter and Space to a toggle, and arrows, Home and End to moves in single selection only', () => {
    expect(chipGroupKeyAction('Enter', false)).toBe('toggle');
    expect(chipGroupKeyAction(' ', true)).toBe('toggle');
    expect(chipGroupKeyAction('ArrowRight', false)).toBe(1);
    expect(chipGroupKeyAction('ArrowDown', false)).toBe(1);
    expect(chipGroupKeyAction('ArrowLeft', false)).toBe(-1);
    expect(chipGroupKeyAction('ArrowUp', false)).toBe(-1);
    expect(chipGroupKeyAction('Home', false)).toBe('first');
    expect(chipGroupKeyAction('End', false)).toBe('last');
    expect(chipGroupKeyAction('Tab', false)).toBeUndefined();
    expect(chipGroupKeyAction('ArrowRight', true)).toBeUndefined();
  });

  it('moves to a neighbour and selects it', () => {
    expect(chipGroupMove(VALUES, ['a'], 'a', 1)).toEqual({ focus: 'b', selection: ['b'] });
    expect(chipGroupMove(VALUES, ['b'], 'b', -1)).toEqual({ focus: 'a', selection: ['a'] });
    expect(chipGroupMove(VALUES, [], 'b', 'first')).toEqual({ focus: 'a', selection: ['a'] });
    expect(chipGroupMove(VALUES, ['a'], 'a', 'last')).toEqual({ focus: 'c', selection: ['c'] });
  });

  it('stops at the ends and never clears the selection', () => {
    expect(chipGroupMove(VALUES, ['c'], 'c', 1)).toEqual({ focus: 'c', selection: undefined });
    expect(chipGroupMove(VALUES, ['a'], 'a', -1)).toEqual({ focus: 'a', selection: undefined });
    expect(chipGroupMove(VALUES, ['a'], 'b', 'first')).toEqual({ focus: 'a', selection: undefined });
    expect(chipGroupMove(VALUES, [], 'a', -1)).toEqual({ focus: 'a', selection: ['a'] });
  });

  it('has nowhere to go without chips or from an unknown chip', () => {
    expect(chipGroupMove([], [], 'a', 'first')).toBeUndefined();
    expect(chipGroupMove(VALUES, [], 'z', 1)).toBeUndefined();
  });

  it('lets Tab reach the selected chip, else the first', () => {
    expect(chipGroupTabStop(VALUES, ['b'])).toBe('b');
    expect(chipGroupTabStop(VALUES, [])).toBe('a');
    expect(chipGroupTabStop([], [])).toBeUndefined();
  });
});
