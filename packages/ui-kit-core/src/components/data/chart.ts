/**
 * The SVG charts (PixelSparkline, PixelBarChart, PixelAreaChart): the points
 * they plot, their sizes and tone colours, the Y scale of the line charts and
 * the summary that names a chart for assistive technology.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import type { ToneKey } from '../../tokens';

/**
 * One point of a chart series. Points are spread evenly: `x` only labels one.
 * A point whose `y` is not a finite number (`NaN`, `±Infinity`) is left out:
 * it draws nothing and its place stays empty — the other points keep theirs,
 * so a line runs straight across the gap and the bar chart leaves a slot
 * free — and the scale and the summary take the finite values only.
 */
export interface PixelChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export type ChartSize = 'sm' | 'md' | 'lg';

export interface ChartDimensions {
  width: number;
  height: number;
}

/** Size of the line charts (PixelSparkline, PixelAreaChart), in px. */
export const chartSizes: Readonly<Record<ChartSize, ChartDimensions>> = {
  sm: { width: 120, height: 32 },
  md: { width: 240, height: 60 },
  lg: { width: 360, height: 96 },
};

/** Size of PixelBarChart, in px. */
export const barChartSizes: Readonly<Record<ChartSize, ChartDimensions>> = {
  sm: { width: 160, height: 64 },
  md: { width: 280, height: 120 },
  lg: { width: 420, height: 180 },
};

/** Stroke colour of a line, by tone. */
export const chartStrokeClasses: Readonly<Record<ToneKey, string>> = {
  neutral: 'stroke-retro-muted',
  green: 'stroke-retro-green',
  cyan: 'stroke-retro-cyan',
  gold: 'stroke-retro-gold',
  red: 'stroke-retro-red',
  purple: 'stroke-retro-purple',
  pink: 'stroke-retro-pink',
};

/** Fill colour of an area or a bar, by tone. */
export const chartFillClasses: Readonly<Record<ToneKey, string>> = {
  neutral: 'fill-retro-muted',
  green: 'fill-retro-green',
  cyan: 'fill-retro-cyan',
  gold: 'fill-retro-gold',
  red: 'fill-retro-red',
  purple: 'fill-retro-purple',
  pink: 'fill-retro-pink',
};

/** Fill colour of a value label, by tone. */
export const chartTextFillClasses: Readonly<Record<ToneKey, string>> = {
  neutral: 'fill-retro-muted',
  green: 'fill-retro-green',
  cyan: 'fill-retro-cyan',
  gold: 'fill-retro-gold',
  red: 'fill-retro-red',
  purple: 'fill-retro-purple',
  pink: 'fill-retro-pink',
};

/** Inner padding of the line charts, in px: the stroke is not cut at the edges. */
export const LINE_CHART_PADDING = { x: 2, y: 4 } as const;

/** A data point in the chart's SVG coordinates. */
export interface ChartPoint {
  px: number;
  py: number;
  raw: PixelChartDataPoint;
}

/** The values a series plots: its `y`s that are finite numbers. */
export function chartValues(data: readonly PixelChartDataPoint[]): number[] {
  return data.map((d) => d.y).filter((y) => Number.isFinite(y));
}

/**
 * The points in SVG coordinates. X follows the index, so string labels still
 * spread evenly; Y scales the series' own min..max into the padded height
 * (top is the max), and a flat series sits on the baseline. A point whose `y`
 * is not finite has no coordinates: it is left out, and the others keep the
 * x of their index.
 */
export function normalizeChartPoints(
  data: readonly PixelChartDataPoint[],
  width: number,
  height: number,
  padX: number,
  padY: number,
): ChartPoint[] {
  const ys = chartValues(data);
  if (!ys.length) return [];
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yRange = yMax - yMin || 1;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const step = data.length === 1 ? 0 : innerW / (data.length - 1);
  return data.flatMap((d, i) => {
    if (!Number.isFinite(d.y)) return [];
    const px = padX + step * i;
    const py = padY + (innerH - ((d.y - yMin) / yRange) * innerH);
    return [{ px, py, raw: d }];
  });
}

/** `"x,y x,y …"` for a `points` attribute, at two decimals. */
export function chartPointList(points: readonly ChartPoint[]): string {
  return points.map((p) => `${p.px.toFixed(2)},${p.py.toFixed(2)}`).join(' ');
}

export type ChartKind = 'sparkline' | 'bar chart' | 'area chart';

/**
 * The chart's default accessible name: its kind, point count and value range,
 * of the finite values only — a series without one has no data.
 */
export function describeChart(kind: ChartKind, data: readonly PixelChartDataPoint[]): string {
  const ys = chartValues(data);
  if (!ys.length) return `${kind}, no data`;
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  return `${kind} with ${ys.length} ${ys.length === 1 ? 'point' : 'points'}, range ${min} to ${max}`;
}

/** `shape-rendering` of a chart: crisp pixel edges, or smooth ones on the linear surface. */
export function chartShapeRendering(surface: Surface): 'crispEdges' | 'geometricPrecision' {
  return surface === 'pixel' ? 'crispEdges' : 'geometricPrecision';
}

/** The surface border and radius a chart takes with `bordered`. */
export function chartFrameClasses(surface: Surface, bordered: boolean): string {
  const s = surfaceClasses(surface);
  return cn(bordered && s.border, bordered && s.radius, bordered && 'border-retro-border');
}
