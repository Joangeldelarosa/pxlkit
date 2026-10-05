'use client';

import React, { forwardRef } from 'react';
import {
  barChartClasses,
  barChartGeometry,
  chartShapeRendering,
  describeChart,
  type BarChartOrientation,
  type ChartSize,
  type PixelChartDataPoint,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

/* ──────────────────────────────────────────────────────────────────────────
   PixelBarChart — one rect per point. Vertical (default) or horizontal.
   Pixel surface keeps the bars stepped + crisp; linear smooths the corners.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelBarChartProps extends React.SVGAttributes<SVGSVGElement> {
  /** The series, one bar per point; one whose `y` is not finite leaves its slot empty. */
  data: PixelChartDataPoint[];
  /** Colour of the bars and their labels. */
  tone?: ToneKey;
  /** 160×64, 280×120 or 420×180 px. */
  size?: ChartSize;
  /** Bars growing up, or to the right. */
  orientation?: BarChartOrientation;
  /** Labels each bar with its value. */
  showValues?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to false (no chrome). */
  bordered?: boolean;
}

export const PixelBarChart = forwardRef<SVGSVGElement, PixelBarChartProps>(function PixelBarChart(
  {
    data,
    tone = 'cyan',
    size = 'md',
    orientation = 'vertical',
    showValues = false,
    surface: surfaceProp,
    bordered = false,
    className,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const { width, height, bars, radius, labelAnchor } = barChartGeometry(data, surface, { size, orientation, showValues });
  const classes = barChartClasses(surface, { tone, bordered });

  const label = ariaLabel ?? describeChart('bar chart', data);

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering={chartShapeRendering(surface)}
      className={cn(classes.root, className)}
      {...rest}
    >
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.width}
          height={b.height}
          rx={radius}
          ry={radius}
          className={classes.bar}
        />
      ))}
      {showValues &&
        bars.map((b, i) => (
          <text
            key={`v-${i}`}
            x={b.labelX}
            y={b.labelY}
            textAnchor={labelAnchor}
            fontSize={9}
            className={classes.value}
          >
            {b.raw.y}
          </text>
        ))}
    </svg>
  );
});

PixelBarChart.displayName = 'PixelBarChart';
