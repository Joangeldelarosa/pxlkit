'use client';

import { ToneKey } from '../tokens';

/* ──────────────────────────────────────────────────────────────────────────
   Shared types + helpers.
   Pure SVG. No deps. Tone-aware via the same retro-* tokens used elsewhere.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export type ChartSize = 'sm' | 'md' | 'lg';

export interface Dim {
  width: number;
  height: number;
}

export const sizeMap: Record<ChartSize, Dim> = {
  sm: { width: 120, height: 32 },
  md: { width: 240, height: 60 },
  lg: { width: 360, height: 96 },
};

export const barSizeMap: Record<ChartSize, Dim> = {
  sm: { width: 160, height: 64 },
  md: { width: 280, height: 120 },
  lg: { width: 420, height: 180 },
};

/** Tone → SVG class color. Uses the same retro-* classes the rest of the kit relies on. */
export const strokeClassMap: Record<ToneKey, string> = {
  neutral: 'stroke-retro-muted',
  green: 'stroke-retro-green',
  cyan: 'stroke-retro-cyan',
  gold: 'stroke-retro-gold',
  red: 'stroke-retro-red',
  purple: 'stroke-retro-purple',
  pink: 'stroke-retro-pink',
};

export const fillClassMap: Record<ToneKey, string> = {
  neutral: 'fill-retro-muted',
  green: 'fill-retro-green',
  cyan: 'fill-retro-cyan',
  gold: 'fill-retro-gold',
  red: 'fill-retro-red',
  purple: 'fill-retro-purple',
  pink: 'fill-retro-pink',
};

export const textFillClassMap: Record<ToneKey, string> = {
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
export function normalize(
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

export function describeChart(kind: 'sparkline' | 'bar chart' | 'area chart', data: PixelChartDataPoint[]): string {
  if (!data.length) return `${kind}, no data`;
  const ys = data.map(d => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  return `${kind} with ${data.length} points, range ${min} to ${max}`;
}

/* ──────────────────────────────────────────────────────────────────────────
   Chart components live in their own dedicated files; re-exported here so
   this module's API stays unchanged.
   ────────────────────────────────────────────────────────────────────────── */

export { PixelSparkline, type PixelSparklineProps } from './PixelSparkline';
export { PixelBarChart, type PixelBarChartProps } from './PixelBarChart';
export { PixelAreaChart, type PixelAreaChartProps } from './PixelAreaChart';
