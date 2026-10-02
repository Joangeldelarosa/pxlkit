import { describe, expect, it } from 'vitest';
import { clusterClasses, surfaceClasses } from '../../../index';

describe('cluster recipe', () => {
  it('wraps a row with the gap and cross-axis alignment', () => {
    expect(clusterClasses('pixel', { gap: 4, align: 'center' })).toBe(
      `flex flex-row flex-wrap gap-4 items-center ${surfaceClasses('pixel').transition}`,
    );
    expect(clusterClasses('linear', { gap: 0, align: 'baseline' })).toBe(
      `flex flex-row flex-wrap gap-0 items-baseline ${surfaceClasses('linear').transition}`,
    );
  });

  it('distributes along the row only when asked', () => {
    expect(clusterClasses('pixel', { gap: 6, align: 'start', justify: 'between' })).toBe(
      `flex flex-row flex-wrap gap-6 items-start justify-between ${surfaceClasses('pixel').transition}`,
    );
    expect(clusterClasses('pixel', { gap: 6, align: 'start' })).not.toContain('justify-');
  });
});
