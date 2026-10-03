import { describe, expect, it } from 'vitest';
import {
  barChartClasses,
  barChartGeometry,
  chartFrameClasses,
  type PixelChartDataPoint,
} from '../../../index';

const series = (...ys: number[]): PixelChartDataPoint[] => ys.map((y, x) => ({ x, y }));

describe('bar chart', () => {
  it('grows vertical bars from the zero line, with labels centred above them', () => {
    const { width, height, bars, radius, labelAnchor } = barChartGeometry(series(4, -4), 'pixel', {
      size: 'sm',
      orientation: 'vertical',
      showValues: false,
    });
    expect([width, height, radius, labelAnchor]).toEqual([160, 64, 0, 'middle']);
    expect(bars).toEqual([
      { x: 4, y: 4, width: 75, height: 56, raw: { x: 0, y: 4 }, labelX: 41.5, labelY: 0 },
      // A zero-height bar keeps a 2 px sliver, drawn from the zero line.
      { x: 81, y: 60, width: 75, height: 2, raw: { x: 1, y: -4 }, labelX: 118.5, labelY: 56 },
    ]);
  });

  it('lays horizontal bars from the left, with room for labels after them', () => {
    const { bars, labelAnchor } = barChartGeometry(series(4, -4), 'pixel', {
      size: 'sm',
      orientation: 'horizontal',
      showValues: true,
    });
    expect(labelAnchor).toBe('start');
    expect(bars).toEqual([
      { x: 4, y: 14, width: 152, height: 17, raw: { x: 0, y: 4 }, labelX: 160, labelY: 25.5 },
      { x: 4, y: 33, width: 2, height: 17, raw: { x: 1, y: -4 }, labelX: 10, labelY: 44.5 },
    ]);
  });

  it('rounds the corners and tightens the gaps on the linear surface', () => {
    const { bars, radius } = barChartGeometry(series(2, 0), 'linear', { size: 'sm', orientation: 'vertical', showValues: false });
    expect(radius).toBe(2);
    expect(bars.map((bar) => [bar.x, bar.width, bar.height])).toEqual([
      [4, 75.5, 56],
      [80.5, 75.5, 1],
    ]);
  });

  it('keeps all-positive bars on a scale from zero, and equal values at full height', () => {
    expect(
      barChartGeometry(series(5, 5), 'pixel', { size: 'md', orientation: 'vertical', showValues: false }).bars.map(
        (bar) => [bar.y, bar.height],
      ),
    ).toEqual([
      [4, 112],
      [4, 112],
    ]);
    expect(
      barChartGeometry(series(0, 0), 'pixel', { size: 'lg', orientation: 'horizontal', showValues: false }).bars.map(
        (bar) => bar.width,
      ),
    ).toEqual([2, 2]);
  });

  it('has no bars without data, and NaN bars for NaN values', () => {
    expect(barChartGeometry([], 'pixel', { size: 'md', orientation: 'vertical', showValues: false }).bars).toEqual([]);
    const [bar] = barChartGeometry(series(Number.NaN), 'pixel', { size: 'md', orientation: 'vertical', showValues: false }).bars;
    expect([bar.x, bar.y, bar.height]).toEqual([4, Number.NaN, Number.NaN]);
  });

  it('fills the bars and colours the labels in the tone', () => {
    expect(barChartClasses('pixel', { tone: 'gold', bordered: false })).toEqual({
      root: 'overflow-visible max-w-full h-auto',
      bar: 'fill-retro-gold',
      value: 'fill-retro-gold',
    });
    expect(barChartClasses('linear', { tone: 'gold', bordered: true }).root).toBe(
      `overflow-visible max-w-full h-auto ${chartFrameClasses('linear', true)}`,
    );
  });
});
