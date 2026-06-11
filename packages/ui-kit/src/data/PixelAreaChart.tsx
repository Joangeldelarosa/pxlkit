'use client';

import React, { forwardRef, useMemo } from 'react';
import { cn, Surface, surfaceClasses, useEffectiveSurface } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';
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
   PixelAreaChart — filled polygon. Optional smoothing only changes the
   line cap; the polygon itself stays polygonal (no curves) so pixel surface
   stays crisp under shapeRendering=crispEdges.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelAreaChartProps extends React.SVGAttributes<SVGSVGElement> {
  data: PixelChartDataPoint[];
  tone?: ToneKey;
  size?: ChartSize;
  smooth?: boolean;
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
  const s = surfaceClasses(surface);
  const { width, height } = sizeMap[size];
  const padX = 2;
  const padY = 4;

  const points = useMemo(() => normalize(data, width, height, padX, padY), [data, width, height]);
  const linePoints = points.map(p => `${p.px.toFixed(2)},${p.py.toFixed(2)}`).join(' ');
  // close polygon down to baseline so it fills as an area
  const baselineY = (height - padY).toFixed(2);
  const first = points[0];
  const last = points[points.length - 1];
  const polygonPoints =
    points.length > 0
      ? `${first.px.toFixed(2)},${baselineY} ${linePoints} ${last.px.toFixed(2)},${baselineY}`
      : '';

  const label = ariaLabel ?? describeChart('area chart', data);
  const t = toneTokens[tone];

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
      className={cn('overflow-visible', bordered && s.border, bordered && s.radius, className)}
      data-tone-glow={t.glow}
      data-smooth={smooth || undefined}
      {...rest}
    >
      {polygonPoints && (
        <polygon
          points={polygonPoints}
          strokeWidth={surface === 'pixel' ? 2 : 1.5}
          strokeLinejoin={smooth && surface !== 'pixel' ? 'round' : 'miter'}
          className={cn(strokeClassMap[tone], fillClassMap[tone], 'opacity-90')}
          fillOpacity={0.25}
        />
      )}
    </svg>
  );
});

PixelAreaChart.displayName = 'PixelAreaChart';
