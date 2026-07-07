'use client';

import React, { forwardRef, useMemo } from 'react';
import { cn, Surface, surfaceClasses, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';
import {
  type ChartSize,
  type PixelChartDataPoint,
  describeChart,
  fillClassMap,
  normalize,
  sizeMap,
  strokeClassMap,
} from './PixelChartPrimitives';

/* ──────────────────────────────────────────────────────────────────────────
   PixelSparkline — polyline trend line. Optional filled area underneath.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelSparklineProps extends React.SVGAttributes<SVGSVGElement> {
  data: PixelChartDataPoint[];
  tone?: ToneKey;
  size?: ChartSize;
  showArea?: boolean;
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
  const s = surfaceClasses(surface);
  const { width, height } = sizeMap[size];
  const padX = 2;
  const padY = 4;

  const points = useMemo(() => normalize(data, width, height, padX, padY), [data, width, height]);
  const polylinePoints = points.map(p => `${p.px.toFixed(2)},${p.py.toFixed(2)}`).join(' ');
  const areaPoints =
    points.length > 1
      ? `${points[0].px.toFixed(2)},${(height - padY).toFixed(2)} ${polylinePoints} ${points[points.length - 1].px.toFixed(2)},${(height - padY).toFixed(2)}`
      : '';

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
      shapeRendering={surface === 'pixel' ? 'crispEdges' : 'geometricPrecision'}
      className={cn('overflow-visible max-w-full', bordered && s.border, bordered && s.radius, className)}
      {...rest}
    >
      {showArea && areaPoints && (
        <polygon
          points={areaPoints}
          className={cn(fillClassMap[tone], 'opacity-20')}
          stroke="none"
        />
      )}
      <polyline
        points={polylinePoints}
        fill="none"
        strokeWidth={surface === 'pixel' ? 2 : 1.5}
        strokeLinejoin={surface === 'pixel' ? 'miter' : 'round'}
        strokeLinecap={surface === 'pixel' ? 'square' : 'round'}
        className={cn(strokeClassMap[tone])}
      />
    </svg>
  );
});

PixelSparkline.displayName = 'PixelSparkline';
