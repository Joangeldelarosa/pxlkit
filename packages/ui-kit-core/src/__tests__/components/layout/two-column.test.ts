import { describe, expect, it } from 'vitest';
import {
  surfaceClasses,
  twoColumnClasses,
  twoColumnRatioClasses,
  twoColumnSideClasses,
  twoColumnStackedRatioClasses,
  type TwoColumnRatio,
} from '../../../index';

const RATIOS: Record<TwoColumnRatio, string> = {
  '50/50': '1fr_1fr',
  '60/40': '3fr_2fr',
  '40/60': '2fr_3fr',
  '70/30': '7fr_3fr',
  '30/70': '3fr_7fr',
};
const transition = surfaceClasses('pixel').transition;

describe('two-column recipes', () => {
  it('spells out the column template of every ratio, at every width and from each breakpoint', () => {
    for (const [ratio, template] of Object.entries(RATIOS) as Array<[TwoColumnRatio, string]>) {
      expect(twoColumnRatioClasses[ratio]).toBe(`grid-cols-[${template}]`);
      for (const breakpoint of ['sm', 'md', 'lg'] as const) {
        expect(twoColumnStackedRatioClasses[breakpoint][ratio]).toBe(`${breakpoint}:grid-cols-[${template}]`);
      }
    }
  });

  it('stacks the columns below the breakpoint, or keeps them side by side', () => {
    expect(twoColumnClasses('pixel', { ratio: '60/40', gap: 6, stackBelow: 'md' })).toBe(
      `grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 ${transition}`,
    );
    expect(twoColumnClasses('pixel', { ratio: '70/30', gap: 4 })).toBe(`grid grid-cols-[7fr_3fr] gap-4 ${transition}`);
  });

  it('aligns the columns and draws the surface border on request', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(twoColumnClasses(surface, { ratio: '50/50', gap: 8, stackBelow: 'lg', align: 'center', bordered: true })).toBe(
        `grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-center ${s.border} ${s.radius} border-retro-border ${s.transition}`,
      );
    }
  });

  it('swaps the columns on screen when reversed', () => {
    expect(twoColumnSideClasses(false)).toEqual({ left: '', right: '' });
    expect(twoColumnSideClasses(true)).toEqual({ left: 'order-2', right: 'order-1' });
  });
});
