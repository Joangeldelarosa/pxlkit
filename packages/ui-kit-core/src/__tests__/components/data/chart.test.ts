import { describe, expect, it } from 'vitest';
import {
  barChartSizes,
  chartFillClasses,
  chartFrameClasses,
  chartPointList,
  chartShapeRendering,
  chartSizes,
  chartStrokeClasses,
  chartTextFillClasses,
  chartValues,
  describeChart,
  normalizeChartPoints,
  surfaceClasses,
  tone,
  type PixelChartDataPoint,
  type ToneKey,
} from '../../../index';

const series = (...ys: number[]): PixelChartDataPoint[] => ys.map((y, x) => ({ x, y }));
const tones = Object.keys(tone) as ToneKey[];

describe('chart primitives', () => {
  it('sizes the line charts and the bar chart', () => {
    expect(chartSizes).toEqual({
      sm: { width: 120, height: 32 },
      md: { width: 240, height: 60 },
      lg: { width: 360, height: 96 },
    });
    expect(barChartSizes).toEqual({
      sm: { width: 160, height: 64 },
      md: { width: 280, height: 120 },
      lg: { width: 420, height: 180 },
    });
  });

  it('colours strokes, fills and value labels in every tone', () => {
    for (const key of tones) {
      const color = key === 'neutral' ? 'muted' : key;
      expect(chartStrokeClasses[key]).toBe(`stroke-retro-${color}`);
      expect(chartFillClasses[key]).toBe(`fill-retro-${color}`);
      expect(chartTextFillClasses[key]).toBe(`fill-retro-${color}`);
    }
  });

  it('spreads points evenly and scales Y into the padded height, the max on top', () => {
    const points = normalizeChartPoints(series(10, 20, 30), 240, 60, 2, 4);
    expect(points.map(({ px, py }) => [px, py])).toEqual([
      [2, 56],
      [120, 30],
      [238, 4],
    ]);
    expect(points[1].raw).toEqual({ x: 1, y: 20 });
    expect(chartPointList(points)).toBe('2.00,56.00 120.00,30.00 238.00,4.00');
  });

  it('puts a single point, or a flat series, on the baseline at the left padding', () => {
    expect(normalizeChartPoints(series(7), 240, 60, 2, 4).map(({ px, py }) => [px, py])).toEqual([[2, 56]]);
    expect(normalizeChartPoints(series(5, 5, 5), 120, 32, 2, 4).map(({ py }) => py)).toEqual([28, 28, 28]);
  });

  it('scales negative values like any other', () => {
    expect(normalizeChartPoints(series(-10, 0, 10), 240, 60, 2, 4).map(({ py }) => py)).toEqual([56, 30, 4]);
  });

  it('has no points without data', () => {
    expect(normalizeChartPoints([], 240, 60, 2, 4)).toEqual([]);
    expect(chartPointList([])).toBe('');
  });

  it('leaves out values that are not finite, the other points keeping the x of their index', () => {
    const points = normalizeChartPoints(series(10, Number.NaN, 30, Infinity, 20), 240, 60, 2, 4);
    expect(points.map(({ px, py }) => [px, py])).toEqual([
      [2, 56],
      [120, 4],
      [238, 30],
    ]);
    expect(points.map(({ raw }) => raw.x)).toEqual([0, 2, 4]);
    expect(chartPointList(normalizeChartPoints(series(-Infinity, 7), 240, 60, 2, 4))).toBe('238.00,56.00');
    expect(normalizeChartPoints(series(Number.NaN, Infinity), 240, 60, 2, 4)).toEqual([]);
    expect(chartValues(series(1, Number.NaN, -Infinity, 0, Infinity))).toEqual([1, 0]);
  });

  it('describes a chart by kind, point count and range', () => {
    expect(describeChart('sparkline', series(3, -2, 8))).toBe('sparkline with 3 points, range -2 to 8');
    expect(describeChart('bar chart', series(4))).toBe('bar chart with 1 points, range 4 to 4');
    expect(describeChart('area chart', [])).toBe('area chart, no data');
  });

  it('counts and ranges the finite values only, and has no data without one', () => {
    expect(describeChart('sparkline', series(Number.NaN, 1, Infinity, 5))).toBe('sparkline with 2 points, range 1 to 5');
    expect(describeChart('bar chart', series(Number.NaN, -Infinity))).toBe('bar chart, no data');
  });

  it('renders crisp edges on the pixel surface only, and frames a chart only when bordered', () => {
    expect(chartShapeRendering('pixel')).toBe('crispEdges');
    expect(chartShapeRendering('linear')).toBe('geometricPrecision');
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(chartFrameClasses(surface, true)).toBe(`${s.border} ${s.radius} border-retro-border`);
      expect(chartFrameClasses(surface, false)).toBe('');
    }
  });
});
