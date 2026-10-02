import { describe, expect, it } from 'vitest';
import {
  badgeGroupClasses,
  badgeGroupOverflowClasses,
  badgeGroupTriggerClasses,
  badgeGroupTriggerLabel,
} from '../../../components/data/badge-group';

const classesOf = (value: string) => value.split(' ');

describe('badge group recipes', () => {
  it('wraps the badges and the hidden ones in rows', () => {
    expect(classesOf(badgeGroupClasses)).toEqual(expect.arrayContaining(['inline-flex', 'flex-wrap', 'gap-1.5']));
    expect(classesOf(badgeGroupOverflowClasses)).toEqual(expect.arrayContaining(['flex', 'flex-wrap', 'max-w-xs']));
  });

  it('draws the "+N" button like a badge of the surface, with a focus ring', () => {
    const pixel = classesOf(badgeGroupTriggerClasses('pixel'));
    const linear = classesOf(badgeGroupTriggerClasses('linear'));
    expect(pixel).toEqual(expect.arrayContaining(['border-2', 'pxl-corner-sm', 'font-mono', 'focus-visible:ring-2']));
    expect(linear).toEqual(expect.arrayContaining(['border', 'rounded-full', 'font-sans']));
  });

  it('names the "+N" button with the hidden count', () => {
    expect(badgeGroupTriggerLabel(4)).toBe('Show 4 more');
  });
});
