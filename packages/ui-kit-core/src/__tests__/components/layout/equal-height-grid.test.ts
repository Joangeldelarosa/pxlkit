import { describe, expect, it } from 'vitest';
import { equalHeightGridClasses, equalHeightGridItemClasses, surfaceClasses } from '../../../index';

describe('equal-height grid recipes', () => {
  it('stacks every item as header, stretching body and footer', () => {
    expect(equalHeightGridItemClasses).toBe('grid grid-rows-[auto_1fr_auto]');
  });

  it('keeps items at their own height only when aligned to the top', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const { transition } = surfaceClasses(surface);
      expect(equalHeightGridClasses(surface, 'stretch')).toBe(transition);
      expect(equalHeightGridClasses(surface, 'top')).toBe(`items-start ${transition}`);
    }
  });
});
