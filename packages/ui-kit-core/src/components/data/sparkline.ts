/**
 * PixelSparkline — a series drawn as one polyline, with an optional area
 * filled underneath.
 */
import { cn, type Surface } from '../../common';
import type { ToneKey } from '../../tokens';
import {
  LINE_CHART_PADDING,
  chartFillClasses,
  chartFrameClasses,
  chartPointList,
  chartSizes,
  chartStrokeClasses,
  normalizeChartPoints,
  type ChartSize,
  type PixelChartDataPoint,
} from './chart';

export interface SparklineGeometry {
  width: number;
  height: number;
  /** `points` of the line. */
  line: string;
  /** `points` of the area under the line, down to the baseline; empty below two points. */
  area: string;
}

/** The sparkline's size and the points of its line and area. */
export function sparklineGeometry(data: readonly PixelChartDataPoint[], size: ChartSize): SparklineGeometry {
  const { width, height } = chartSizes[size];
  const points = normalizeChartPoints(data, width, height, LINE_CHART_PADDING.x, LINE_CHART_PADDING.y);
  const line = chartPointList(points);
  const baseline = (height - LINE_CHART_PADDING.y).toFixed(2);
  const area =
    points.length > 1
      ? `${points[0].px.toFixed(2)},${baseline} ${line} ${points[points.length - 1].px.toFixed(2)},${baseline}`
      : '';
  return { width, height, line, area };
}

export interface SparklineStroke {
  width: number;
  linejoin: 'miter' | 'round';
  linecap: 'square' | 'round';
}

/** The line's stroke: square and mitred on the pixel surface, round on the linear one. */
export function sparklineStroke(surface: Surface): SparklineStroke {
  const pixel = surface === 'pixel';
  return { width: pixel ? 2 : 1.5, linejoin: pixel ? 'miter' : 'round', linecap: pixel ? 'square' : 'round' };
}

export interface SparklineClasses {
  root: string;
  area: string;
  line: string;
}

/** Classes of the `<svg>`, the area and the line. */
export function sparklineClasses(surface: Surface, { tone, bordered }: { tone: ToneKey; bordered: boolean }): SparklineClasses {
  return {
    root: cn('overflow-visible max-w-full', chartFrameClasses(surface, bordered)),
    area: cn(chartFillClasses[tone], 'opacity-20'),
    line: cn(chartStrokeClasses[tone]),
  };
}
