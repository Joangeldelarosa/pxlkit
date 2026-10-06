import { describe, expect, it } from 'vitest';
import { stackGap, statGroupClasses, statGroupColumnsClasses, statGroupRole, surfaceClasses, tone } from '../../../index';

describe('stat group recipes', () => {
  it('divides a row with rules in the tone, and frames it', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const t = tone.cyan;
      expect(statGroupClasses(surface, { layout: 'row', columns: 3, tone: 'cyan', bordered: true })).toBe(
        `flex flex-row divide-x overflow-x-auto ${t.border} ${s.border} ${s.radiusLg} ${t.border} bg-retro-surface/40`,
      );
    }
    expect(statGroupClasses('pixel', { layout: 'row', columns: 3, gap: 4, tone: 'neutral', bordered: false })).toBe(
      `flex flex-row divide-x overflow-x-auto ${tone.neutral.border}`,
    );
  });

  it('lays a grid out in 1 to 6 columns, 3 for any other count, flush unless given a gap', () => {
    for (const columns of [1, 2, 3, 4, 5, 6]) {
      expect(statGroupClasses('pixel', { layout: 'grid', columns, tone: 'neutral', bordered: false })).toBe(
        `grid ${statGroupColumnsClasses[columns]}`,
      );
    }
    expect(statGroupClasses('pixel', { layout: 'grid', columns: 9, tone: 'neutral', bordered: false })).toBe(
      'grid grid-cols-1 sm:grid-cols-3',
    );
    expect(statGroupClasses('pixel', { layout: 'grid', columns: 4, gap: 0, tone: 'neutral', bordered: false })).toBe(
      `grid grid-cols-2 sm:grid-cols-4 ${stackGap[0]}`,
    );
    expect(statGroupColumnsClasses[6]).toBe('grid-cols-2 sm:grid-cols-6');
  });

  it('is a group only once it has a name', () => {
    expect(statGroupRole(true)).toBe('group');
    expect(statGroupRole(false)).toBeUndefined();
  });
});
