/**
 * PixelBarChart — one bar per data point, vertical or horizontal, on a scale
 * that always includes zero. The pixel surface keeps the bars square and a
 * touch apart; the linear one rounds their corners.
 */
import { cn, type Surface } from '../../common';
import type { ToneKey } from '../../tokens';
import {
  barChartSizes,
  chartFillClasses,
  chartFrameClasses,
  chartTextFillClasses,
  type ChartSize,
  type PixelChartDataPoint,
} from './chart';

export type BarChartOrientation = 'vertical' | 'horizontal';

export interface BarChartBar {
  x: number;
  y: number;
  width: number;
  height: number;
  raw: PixelChartDataPoint;
  /** Anchor of the bar's value label: above a vertical bar, after a horizontal one. */
  labelX: number;
  labelY: number;
}

export interface BarChartGeometry {
  width: number;
  height: number;
  bars: BarChartBar[];
  /** `rx` and `ry` of every bar. */
  radius: number;
  /** `text-anchor` of the value labels. */
  labelAnchor: 'middle' | 'start';
}

export interface BarChartOptions {
  size: ChartSize;
  orientation: BarChartOrientation;
  /** Leaves room above and below the bars for their value labels. */
  showValues: boolean;
}

/**
 * The bars in SVG coordinates. The scale spans min(0, …values)..max(0,
 * …values), so bars grow from the zero line's side; a bar is never thinner
 * than 2 px (pixel) or 1 px (linear), so a zero still shows.
 */
export function barChartGeometry(
  data: readonly PixelChartDataPoint[],
  surface: Surface,
  { size, orientation, showValues }: BarChartOptions,
): BarChartGeometry {
  const { width, height } = barChartSizes[size];
  const ys = data.map((d) => d.y);
  const yMin = Math.min(0, ...(ys.length ? ys : [0]));
  const yMax = Math.max(0, ...(ys.length ? ys : [0]));
  const yRange = yMax - yMin || 1;

  const pixel = surface === 'pixel';
  const gap = pixel ? 2 : 1;
  const minimum = pixel ? 2 : 1;
  const vertical = orientation === 'vertical';
  const padX = 4;
  const padY = showValues ? 14 : 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const count = data.length || 1;

  const bars = data.map((d, i): BarChartBar => {
    if (vertical) {
      const bw = (innerW - gap * (count - 1)) / count;
      const bh = ((d.y - yMin) / yRange) * innerH;
      const x = padX + i * (bw + gap);
      const y = padY + (innerH - bh);
      const barHeight = Math.max(bh, minimum);
      return { x, y, width: bw, height: barHeight, raw: d, labelX: x + bw / 2, labelY: y - 4 };
    }
    const bh = (innerH - gap * (count - 1)) / count;
    const bw = ((d.y - yMin) / yRange) * innerW;
    const y = padY + i * (bh + gap);
    const barWidth = Math.max(bw, minimum);
    return { x: padX, y, width: barWidth, height: bh, raw: d, labelX: padX + barWidth + 4, labelY: y + bh / 2 + 3 };
  });

  return { width, height, bars, radius: pixel ? 0 : 2, labelAnchor: vertical ? 'middle' : 'start' };
}

export interface BarChartClasses {
  root: string;
  bar: string;
  value: string;
}

/** Classes of the `<svg>`, the bars and their value labels. */
export function barChartClasses(surface: Surface, { tone, bordered }: { tone: ToneKey; bordered: boolean }): BarChartClasses {
  return {
    root: cn('overflow-visible max-w-full h-auto', chartFrameClasses(surface, bordered)),
    bar: cn(chartFillClasses[tone]),
    value: cn(chartTextFillClasses[tone]),
  };
}
