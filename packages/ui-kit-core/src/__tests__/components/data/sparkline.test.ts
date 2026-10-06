import { describe, expect, it } from 'vitest';
import {
  chartFrameClasses,
  sparklineClasses,
  sparklineGeometry,
  sparklineStroke,
  type PixelChartDataPoint,
} from '../../../index';

const series = (...ys: number[]): PixelChartDataPoint[] => ys.map((y, x) => ({ x, y }));

describe('sparkline', () => {
  it('draws the line, and the area under it down to the baseline', () => {
    expect(sparklineGeometry(series(10, 20, 30), 'md')).toEqual({
      width: 240,
      height: 60,
      line: '2.00,56.00 120.00,30.00 238.00,4.00',
      area: '2.00,56.00 2.00,56.00 120.00,30.00 238.00,4.00 238.00,56.00',
    });
    expect(sparklineGeometry(series(1, 2), 'sm')).toMatchObject({ width: 120, height: 32, line: '2.00,28.00 118.00,4.00' });
    expect(sparklineGeometry(series(1, 2), 'lg')).toMatchObject({ width: 360, height: 96, area: '2.00,92.00 2.00,92.00 358.00,4.00 358.00,92.00' });
  });

  it('has no area below two points, and nothing at all without data', () => {
    expect(sparklineGeometry(series(4), 'md')).toEqual({ width: 240, height: 60, line: '2.00,56.00', area: '' });
    expect(sparklineGeometry([], 'md')).toEqual({ width: 240, height: 60, line: '', area: '' });
  });

  it('draws the line and the area across a value that is not finite, from the first plotted point to the last', () => {
    expect(sparklineGeometry(series(Number.NaN, 10, Infinity, 30), 'md')).toEqual({
      width: 240,
      height: 60,
      line: '80.67,56.00 238.00,4.00',
      area: '80.67,56.00 80.67,56.00 238.00,4.00 238.00,56.00',
    });
    expect(sparklineGeometry(series(Number.NaN, 4), 'md')).toEqual({ width: 240, height: 60, line: '238.00,56.00', area: '' });
    expect(sparklineGeometry(series(Number.NaN), 'md')).toEqual({ width: 240, height: 60, line: '', area: '' });
  });

  it('strokes square on the pixel surface and round on the linear one', () => {
    expect(sparklineStroke('pixel')).toEqual({ width: 2, linejoin: 'miter', linecap: 'square' });
    expect(sparklineStroke('linear')).toEqual({ width: 1.5, linejoin: 'round', linecap: 'round' });
  });

  it('tints the line and a faint area in the tone', () => {
    expect(sparklineClasses('pixel', { tone: 'green', bordered: false })).toEqual({
      root: 'overflow-visible max-w-full',
      area: 'fill-retro-green opacity-20',
      line: 'stroke-retro-green',
    });
    expect(sparklineClasses('linear', { tone: 'cyan', bordered: true }).root).toBe(
      `overflow-visible max-w-full ${chartFrameClasses('linear', true)}`,
    );
  });
});
