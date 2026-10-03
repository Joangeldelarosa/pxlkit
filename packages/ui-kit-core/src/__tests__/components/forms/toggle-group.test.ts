import { describe, expect, it } from 'vitest';
import {
  toggleGroupClasses,
  toggleGroupEmptyValue,
  toggleGroupIsPressed,
  toggleGroupKeyMove,
  toggleGroupMoveTarget,
  toggleGroupRole,
  toggleGroupToggle,
} from '../../../index';

describe('toggle group logic', () => {
  it('is a radiogroup in single mode, and a group in multiple mode only when named', () => {
    expect(toggleGroupRole('single', false)).toBe('radiogroup');
    expect(toggleGroupRole('single', true)).toBe('radiogroup');
    expect(toggleGroupRole('multiple', true)).toBe('group');
    expect(toggleGroupRole('multiple', false)).toBeUndefined();
    expect(toggleGroupClasses).toBe('inline-flex items-center gap-1');
  });

  it('starts empty: no value in single mode, no values in multiple mode', () => {
    expect(toggleGroupEmptyValue('single')).toBe('');
    expect(toggleGroupEmptyValue('multiple')).toEqual([]);
  });

  it('presses one toggle in single mode, and empties when the pressed one is pressed again', () => {
    expect(toggleGroupIsPressed('single', 'a', 'a')).toBe(true);
    expect(toggleGroupIsPressed('single', 'a', 'b')).toBe(false);
    expect(toggleGroupToggle('single', 'a', 'b')).toBe('b');
    expect(toggleGroupToggle('single', 'b', 'b')).toBe('');
    expect(toggleGroupToggle('single', '', 'a')).toBe('a');
  });

  it('adds and removes values in multiple mode, keeping the order they were pressed in', () => {
    expect(toggleGroupIsPressed('multiple', ['a', 'c'], 'c')).toBe(true);
    expect(toggleGroupIsPressed('multiple', ['a'], 'b')).toBe(false);
    // A single value given to a multiple group presses nothing.
    expect(toggleGroupIsPressed('multiple', 'a', 'a')).toBe(false);
    expect(toggleGroupToggle('multiple', ['b'], 'a')).toEqual(['b', 'a']);
    expect(toggleGroupToggle('multiple', ['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
    expect(toggleGroupToggle('multiple', 'a', 'b')).toEqual(['b']);
  });

  it('maps the arrow keys, Home and End to focus moves', () => {
    expect(toggleGroupKeyMove('ArrowRight')).toBe(1);
    expect(toggleGroupKeyMove('ArrowDown')).toBe(1);
    expect(toggleGroupKeyMove('ArrowLeft')).toBe(-1);
    expect(toggleGroupKeyMove('ArrowUp')).toBe(-1);
    expect(toggleGroupKeyMove('Home')).toBe('first');
    expect(toggleGroupKeyMove('End')).toBe('last');
    expect(toggleGroupKeyMove('Enter')).toBeUndefined();
    expect(toggleGroupKeyMove(' ')).toBeUndefined();
  });

  it('moves focus one step, stopping at the ends or wrapping round with loop', () => {
    const order = ['a', 'b', 'c'];
    expect(toggleGroupMoveTarget(order, 'a', 1, false)).toBe('b');
    expect(toggleGroupMoveTarget(order, 'c', 1, false)).toBe('c');
    expect(toggleGroupMoveTarget(order, 'a', -1, false)).toBe('a');
    expect(toggleGroupMoveTarget(order, 'c', 1, true)).toBe('a');
    expect(toggleGroupMoveTarget(order, 'a', -1, true)).toBe('c');
    expect(toggleGroupMoveTarget(order, 'b', 'first', false)).toBe('a');
    expect(toggleGroupMoveTarget(order, 'b', 'last', true)).toBe('c');
  });

  it('moves nowhere in an empty group or from a toggle it does not know', () => {
    expect(toggleGroupMoveTarget([], 'a', 1, true)).toBeUndefined();
    expect(toggleGroupMoveTarget([], 'a', 'first', false)).toBeUndefined();
    expect(toggleGroupMoveTarget(['a', 'b'], 'z', 1, true)).toBeUndefined();
    // The ends need no current toggle.
    expect(toggleGroupMoveTarget(['a', 'b'], 'z', 'last', false)).toBe('b');
  });
});
