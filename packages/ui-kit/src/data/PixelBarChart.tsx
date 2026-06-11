'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, surfaceClasses, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';
import {
  type ChartSize,
  type PixelChartDataPoint,
  barSizeMap,
  describeChart,
  fillClassMap,
  textFillClassMap,
} from './PixelChartPrimitives';

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
