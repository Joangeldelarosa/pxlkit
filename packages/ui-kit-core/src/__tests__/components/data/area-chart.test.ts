import { describe, expect, it } from 'vitest';
import {
  areaChartClasses,
  areaChartGeometry,
  areaChartGlow,
  areaChartStroke,
  chartFrameClasses,
  tone,
  type PixelChartDataPoint,
  type ToneKey,
} from '../../../index';

const series = (...ys: number[]): PixelChartDataPoint[] => ys.map((y, x) => ({ x, y }));
const tones = Object.keys(tone) as ToneKey[];

describe('area chart', () => {
  it('closes the line down to the baseline', () => {
    expect(areaChartGeometry(series(10, 20, 30), 'md')).toEqual({
      width: 240,
      height: 60,
      polygon: '2.00,56.00 2.00,56.00 120.00,30.00 238.00,4.00 238.00,56.00',
    });
  });

  it('draws a single point as a degenerate polygon, and nothing without data', () => {
    expect(areaChartGeometry(series(3), 'sm').polygon).toBe('2.00,28.00 2.00,28.00 2.00,28.00');
    expect(areaChartGeometry([], 'lg')).toEqual({ width: 360, height: 96, polygon: '' });
  });

  it('closes the area across a value that is not finite, from the first plotted point to the last', () => {
    expect(areaChartGeometry(series(10, Number.NaN, 30, -Infinity), 'md').polygon).toBe(
      '2.00,56.00 2.00,56.00 159.33,4.00 159.33,56.00',
    );
    expect(areaChartGeometry(series(Infinity, Number.NaN), 'md').polygon).toBe('');
  });

  it('rounds the joins only when smooth on the linear surface', () => {
    expect(areaChartStroke('pixel', false)).toEqual({ width: 2, linejoin: 'miter' });
    expect(areaChartStroke('pixel', true)).toEqual({ width: 2, linejoin: 'miter' });
    expect(areaChartStroke('linear', false)).toEqual({ width: 1.5, linejoin: 'miter' });
    expect(areaChartStroke('linear', true)).toEqual({ width: 1.5, linejoin: 'round' });
  });

  it('strokes and fills the polygon in the tone, and exposes the tone glow', () => {
    expect(areaChartClasses('pixel', { tone: 'purple', bordered: false })).toEqual({
      root: 'overflow-visible max-w-full',
      polygon: 'stroke-retro-purple fill-retro-purple opacity-90',
    });
    expect(areaChartClasses('pixel', { tone: 'cyan', bordered: true }).root).toBe(
      `overflow-visible max-w-full ${chartFrameClasses('pixel', true)}`,
    );
    for (const key of tones) expect(areaChartGlow(key)).toBe(tone[key].glow);
  });
});
