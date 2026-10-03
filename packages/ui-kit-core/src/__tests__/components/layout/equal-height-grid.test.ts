import { describe, expect, it } from 'vitest';
import { equalHeightGridAlign, equalHeightGridClasses, equalHeightGridItemClasses, gridClasses, surfaceClasses } from '../../../index';

describe('equal-height grid recipes', () => {
  it('stacks every item as header, stretching body and footer', () => {
    expect(equalHeightGridItemClasses).toBe('grid grid-rows-[auto_1fr_auto]');
  });

  it('adds the surface transition to the grid', () => {
    for (const surface of ['pixel', 'linear'] as const) expect(equalHeightGridClasses(surface)).toBe(surfaceClasses(surface).transition);
  });

  // Regression: a top-aligned grid kept the grid's own `items-stretch` next to
  // `items-start`, and Tailwind emits `items-stretch` later, so items still
  // stretched.
  it('keeps items at their own height only when aligned to the top, with one alignment class', () => {
    expect(equalHeightGridAlign('stretch')).toBe('stretch');
    expect(equalHeightGridAlign('top')).toBe('start');
    const top = gridClasses('pixel', { gap: 4, align: equalHeightGridAlign('top') }).split(' ');
    expect(top).toContain('items-start');
    expect(top).not.toContain('items-stretch');
  });
});
