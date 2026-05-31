'use client';

import React, { forwardRef, useMemo } from 'react';
import { cn, Surface, surfaceClasses, useEffectiveSurface } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

/* ──────────────────────────────────────────────────────────────────────────
   Shared types + helpers.
   Pure SVG. No deps. Tone-aware via the same retro-* tokens used elsewhere.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

type ChartSize = 'sm' | 'md' | 'lg';

interface Dim {
  width: number;
  height: number;
}

const sizeMap: Record<ChartSize, Dim> = {
  sm: { width: 120, height: 32 },
  md: { width: 240, height: 60 },
  lg: { width: 360, height: 96 },
};

const barSizeMap: Record<ChartSize, Dim> = {
  sm: { width: 160, height: 64 },
  md: { width: 280, height: 120 },
  lg: { width: 420, height: 180 },
};

/** Tone → SVG class color. Uses the same retro-* classes the rest of the kit relies on. */
const strokeClassMap: Record<ToneKey, string> = {
  neutral: 'stroke-retro-muted',
  green: 'stroke-retro-green',
  cyan: 'stroke-retro-cyan',
  gold: 'stroke-retro-gold',
  red: 'stroke-retro-red',
  purple: 'stroke-retro-purple',
  pink: 'stroke-retro-pink',
};

const fillClassMap: Record<ToneKey, string> = {
  neutral: 'fill-retro-muted',
  green: 'fill-retro-green',
  cyan: 'fill-retro-cyan',
  gold: 'fill-retro-gold',
  red: 'fill-retro-red',
  purple: 'fill-retro-purple',
  pink: 'fill-retro-pink',
};

const textFillClassMap: Record<ToneKey, string> = {
  neutral: 'fill-retro-muted',
  green: 'fill-retro-green',
  cyan: 'fill-retro-cyan',
  gold: 'fill-retro-gold',
  red: 'fill-retro-red',
  purple: 'fill-retro-purple',
  pink: 'fill-retro-pink',
};

/**
 * Normalize data points to SVG-space coordinates.
 * X is index-based (so string x labels still spread evenly).
 * Y is min/max normalized into [pad, height - pad].
 */
function normalize(
  data: PixelChartDataPoint[],
  width: number,
  height: number,
  padX: number,
  padY: number,
): { px: number; py: number; raw: PixelChartDataPoint }[] {
  if (!data.length) return [];
  const ys = data.map(d => d.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yRange = yMax - yMin || 1;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const step = data.length === 1 ? 0 : innerW / (data.length - 1);
  return data.map((d, i) => {
    const px = padX + step * i;
    const py = padY + (innerH - ((d.y - yMin) / yRange) * innerH);
    return { px, py, raw: d };
  });
}

function describeChart(kind: 'sparkline' | 'bar chart' | 'area chart', data: PixelChartDataPoint[]): string {
  if (!data.length) return `${kind}, no data`;
  const ys = data.map(d => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  return `${kind} with ${data.length} points, range ${min} to ${max}`;
}

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
      className={cn('overflow-visible', bordered && s.border, bordered && s.radius, className)}
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

/* ──────────────────────────────────────────────────────────────────────────
   PixelBarChart — one rect per point. Vertical (default) or horizontal.
   Pixel surface keeps the bars stepped + crisp; linear smooths the corners.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelBarChartProps extends React.SVGAttributes<SVGSVGElement> {
  data: PixelChartDataPoint[];
  tone?: ToneKey;
  size?: ChartSize;
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
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
  const s = surfaceClasses(surface);
  const { width, height } = barSizeMap[size];

  const ys = data.map(d => d.y);
  const yMin = Math.min(0, ...(ys.length ? ys : [0]));
  const yMax = Math.max(0, ...(ys.length ? ys : [0]));
  const yRange = yMax - yMin || 1;

  const gap = surface === 'pixel' ? 2 : 1;
  const isVertical = orientation === 'vertical';
  const padX = 4;
  const padY = showValues ? 14 : 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const count = data.length || 1;

  const bars = data.map((d, i) => {
    if (isVertical) {
      const bw = (innerW - gap * (count - 1)) / count;
      const bh = ((d.y - yMin) / yRange) * innerH;
      const bx = padX + i * (bw + gap);
      const by = padY + (innerH - bh);
      return { x: bx, y: by, width: bw, height: Math.max(bh, surface === 'pixel' ? 2 : 1), raw: d };
    }
    const bh = (innerH - gap * (count - 1)) / count;
    const bw = ((d.y - yMin) / yRange) * innerW;
    const bx = padX;
    const by = padY + i * (bh + gap);
    return { x: bx, y: by, width: Math.max(bw, surface === 'pixel' ? 2 : 1), height: bh, raw: d };
  });

  const label = ariaLabel ?? describeChart('bar chart', data);

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering={surface === 'pixel' ? 'crispEdges' : 'geometricPrecision'}
      className={cn('overflow-visible', bordered && s.border, bordered && s.radius, className)}
      {...rest}
    >
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.width}
          height={b.height}
          rx={surface === 'pixel' ? 0 : 2}
          ry={surface === 'pixel' ? 0 : 2}
          className={cn(fillClassMap[tone])}
        />
      ))}
      {showValues &&
        bars.map((b, i) => (
          <text
            key={`v-${i}`}
            x={isVertical ? b.x + b.width / 2 : b.x + b.width + 4}
            y={isVertical ? b.y - 4 : b.y + b.height / 2 + 3}
            textAnchor={isVertical ? 'middle' : 'start'}
            fontSize={9}
            className={cn(textFillClassMap[tone])}
          >
            {b.raw.y}
          </text>
        ))}
    </svg>
  );
});

PixelBarChart.displayName = 'PixelBarChart';

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
