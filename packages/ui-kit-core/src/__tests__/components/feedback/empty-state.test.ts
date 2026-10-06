import { describe, expect, it } from 'vitest';
import { emptyStateClasses, surfaceClasses } from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('empty state recipes', () => {
  it('draws a dashed, centred placeholder framed per surface', () => {
    const pixel = classesOf(emptyStateClasses('pixel').root);
    const linear = classesOf(emptyStateClasses('linear').root);
    for (const root of [pixel, linear]) {
      expect(root).toEqual(expect.arrayContaining(['border-dashed', 'border-retro-border/60', 'p-8', 'text-center']));
    }
    expect(pixel).toEqual(expect.arrayContaining(['border-2', 'pxl-corner-md']));
    expect(linear).toEqual(expect.arrayContaining(['border', 'rounded-xl']));
  });

  it('sets the title in the surface font, the icon in cyan and spaces the action', () => {
    expect(emptyStateClasses('linear').title).toBe(`text-sm font-semibold text-retro-text ${surfaceClasses('linear').font}`);
    expect(emptyStateClasses('pixel').icon).toBe('mb-3 flex items-center justify-center text-retro-cyan');
    expect(emptyStateClasses('pixel').description).toBe('mx-auto mt-2 max-w-sm text-sm text-retro-muted');
    expect(emptyStateClasses('pixel').action).toBe('mt-5');
  });
});
