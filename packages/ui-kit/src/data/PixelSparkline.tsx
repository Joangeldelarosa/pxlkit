'use client';

import React, { forwardRef, useMemo } from 'react';
import {
  chartShapeRendering,
  describeChart,
  sparklineClasses,
  sparklineGeometry,
  sparklineStroke,
  type ChartSize,
  type PixelChartDataPoint,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

/* ──────────────────────────────────────────────────────────────────────────
   PixelSparkline — polyline trend line. Optional filled area underneath.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelSparklineProps extends React.SVGAttributes<SVGSVGElement> {
  /**
   * The series. Points are spread evenly; `x` only labels them, and one whose `y` is not finite is
   * left out.
   */
  data: PixelChartDataPoint[];
  /** Colour of the line and the area. */
  tone?: ToneKey;
  /** 120×32, 240×60 or 360×96 px. */
  size?: ChartSize;
  /** Fills the area under the line, faintly. */
  showArea?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to false (no chrome). */
  bordered?: boolean;
}

export const PixelSparkline = forwardRef<SVGSVGElement, PixelSparklineProps>(function PixelSparkline(
  {
    data,
    tone = 'cyan',
    size = 'md',
    showArea = false,
    surface: surfaceProp,
    bordered = false,
    className,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const { width, height, line, area } = useMemo(() => sparklineGeometry(data, size), [data, size]);
  const stroke = sparklineStroke(surface);
  const classes = sparklineClasses(surface, { tone, bordered });

  const label = ariaLabel ?? describeChart('sparkline', data);

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
      {...rest}
    >
      {showArea && area && (
        <polygon
          points={area}
          className={classes.area}
          stroke="none"
        />
      )}
      <polyline
        points={line}
        fill="none"
        strokeWidth={stroke.width}
        strokeLinejoin={stroke.linejoin}
        strokeLinecap={stroke.linecap}
        className={classes.line}
      />
    </svg>
  );
});

PixelSparkline.displayName = 'PixelSparkline';
