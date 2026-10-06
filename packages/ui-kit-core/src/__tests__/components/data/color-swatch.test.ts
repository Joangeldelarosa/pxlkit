import { describe, expect, it } from 'vitest';
import { colorSwatchClasses, colorSwatchFill } from '../../../components/data/color-swatch';

const classesOf = (value: string) => value.split(' ');

describe('color swatch recipes', () => {
  it('frames the sample and sets the labels in the surface font', () => {
    const pixel = colorSwatchClasses('pixel');
    expect(classesOf(pixel.sample)).toEqual(expect.arrayContaining(['h-8', 'w-8', 'border-2', 'pxl-corner-sm']));
    expect(classesOf(pixel.name)).toContain('font-mono');
    expect(classesOf(pixel.variable)).toContain('font-mono');
    const linear = colorSwatchClasses('linear');
    expect(classesOf(linear.sample)).toEqual(expect.arrayContaining(['border', 'rounded-md']));
    expect(classesOf(linear.name)).toContain('font-sans');
    expect(linear.root).toBe('flex items-center gap-3');
  });

  it('fills the sample from the CSS variable', () => {
    expect(colorSwatchFill('--color-retro-cyan')).toBe('var(--color-retro-cyan)');
  });
});
