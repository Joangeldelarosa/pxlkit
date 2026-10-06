import { describe, expect, it } from 'vitest';
import { kbdClasses } from '../../../components/data/kbd';

const classesOf = (value: string) => value.split(' ');

describe('kbd recipes', () => {
  it('draws a keycap with depth on both surfaces: a deeper bottom edge on pixel, a drop shadow on linear', () => {
    // A shadow could not show past the pixel keycap's cut corners: its depth is
    // a bottom edge twice as thick, in the stronger border colour.
    const pixel = classesOf(kbdClasses('pixel'));
    expect(pixel).toEqual(
      expect.arrayContaining(['border-2', 'border-b-4', 'border-b-retro-border-strong', 'pxl-corner-sm', 'font-mono', 'bg-retro-surface']),
    );
    expect(pixel.filter((name) => name.startsWith('shadow-'))).toEqual([]);
    const linear = classesOf(kbdClasses('linear'));
    expect(linear).toEqual(expect.arrayContaining(['border', 'rounded-md', 'font-sans', 'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]']));
    expect(linear).not.toContain('border-b-4');
  });
});
