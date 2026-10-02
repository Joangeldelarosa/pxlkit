import { describe, expect, it } from 'vitest';
import { kbdClasses } from '../../../components/data/kbd';

const classesOf = (value: string) => value.split(' ');

describe('kbd recipes', () => {
  it('draws a keycap with a deeper shadow on the pixel surface', () => {
    expect(classesOf(kbdClasses('pixel'))).toEqual(
      expect.arrayContaining(['border-2', 'pxl-corner-sm', 'font-mono', 'bg-retro-surface', 'shadow-[0_2px_0_0_rgba(0,0,0,0.25)]']),
    );
    const linear = classesOf(kbdClasses('linear'));
    expect(linear).toEqual(expect.arrayContaining(['border', 'rounded-md', 'font-sans', 'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]']));
    expect(linear).not.toContain('shadow-[0_2px_0_0_rgba(0,0,0,0.25)]');
  });
});
