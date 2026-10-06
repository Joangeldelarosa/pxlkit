/**
 * PixelAreaChart — a series drawn as a filled polygon closed down to the
 * baseline. The polygon stays polygonal (no curves), so the pixel surface
 * keeps crisp edges; `smooth` only rounds the joins on the linear surface.
 */
import { cn, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';
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

export interface AreaChartGeometry {
  width: number;
  height: number;
  /** `points` of the area: the line, closed down to the baseline; empty without a plotted point. */
  polygon: string;
}

/**
 * The area chart's size and the points of its polygon. Points without a
 * finite value are left out (see `normalizeChartPoints`): the area spans the
 * plotted ones.
 */
export function areaChartGeometry(data: readonly PixelChartDataPoint[], size: ChartSize): AreaChartGeometry {
  const { width, height } = chartSizes[size];
  const points = normalizeChartPoints(data, width, height, LINE_CHART_PADDING.x, LINE_CHART_PADDING.y);
  const baseline = (height - LINE_CHART_PADDING.y).toFixed(2);
  const polygon =
    points.length > 0
      ? `${points[0].px.toFixed(2)},${baseline} ${chartPointList(points)} ${points[points.length - 1].px.toFixed(2)},${baseline}`
      : '';
  return { width, height, polygon };
}

export interface AreaChartStroke {
  width: number;
  linejoin: 'miter' | 'round';
}

/** The outline's stroke: rounded joins only for `smooth` on the linear surface. */
export function areaChartStroke(surface: Surface, smooth: boolean): AreaChartStroke {
  return { width: surface === 'pixel' ? 2 : 1.5, linejoin: smooth && surface !== 'pixel' ? 'round' : 'miter' };
}

export interface AreaChartClasses {
  root: string;
  polygon: string;
}

/** Classes of the `<svg>` and the polygon. */
export function areaChartClasses(surface: Surface, { tone, bordered }: { tone: ToneKey; bordered: boolean }): AreaChartClasses {
  return {
    root: cn('overflow-visible max-w-full', chartFrameClasses(surface, bordered)),
    polygon: cn(chartStrokeClasses[tone], chartFillClasses[tone], 'opacity-90'),
  };
}

/** The tone's glow shadow, which the chart exposes as `data-tone-glow`. */
export function areaChartGlow(tone: ToneKey): string {
  return toneTokens[tone].glow;
}
