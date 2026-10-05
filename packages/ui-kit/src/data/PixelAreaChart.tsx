'use client';

import React, { forwardRef, useMemo } from 'react';
import {
  areaChartClasses,
  areaChartGeometry,
  areaChartGlow,
  areaChartStroke,
  chartShapeRendering,
  describeChart,
  type ChartSize,
  type PixelChartDataPoint,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

/* ──────────────────────────────────────────────────────────────────────────
   PixelAreaChart — filled polygon. Optional smoothing only changes the
   line cap; the polygon itself stays polygonal (no curves) so pixel surface
   stays crisp under shapeRendering=crispEdges.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelAreaChartProps extends React.SVGAttributes<SVGSVGElement> {
  /**
   * The series. Points are spread evenly; `x` only labels them, and one whose `y` is not finite is
   * left out.
   */
  data: PixelChartDataPoint[];
  /** Colour of the outline and the fill. */
  tone?: ToneKey;
  /** 120×32, 240×60 or 360×96 px. */
  size?: ChartSize;
  /** Rounds the outline's joins (linear surface only). */
  smooth?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to false (no chrome). */
  bordered?: boolean;
}

export const PixelAreaChart = forwardRef<SVGSVGElement, PixelAreaChartProps>(function PixelAreaChart(
  {
    data,
    tone = 'cyan',
    size = 'md',
    smooth = false,
    surface: surfaceProp,
    bordered = false,
    className,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const { width, height, polygon } = useMemo(() => areaChartGeometry(data, size), [data, size]);
  const stroke = areaChartStroke(surface, smooth);
  const classes = areaChartClasses(surface, { tone, bordered });

  const label = ariaLabel ?? describeChart('area chart', data);

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      shapeRendering={chartShapeRendering(surface)}
      className={cn(classes.root, className)}
      data-tone-glow={areaChartGlow(tone)}
      data-smooth={smooth || undefined}
      {...rest}
    >
      {polygon && (
        <polygon
          points={polygon}
          strokeWidth={stroke.width}
          strokeLinejoin={stroke.linejoin}
          className={classes.polygon}
          fillOpacity={0.25}
        />
      )}
    </svg>
  );
});

PixelAreaChart.displayName = 'PixelAreaChart';
