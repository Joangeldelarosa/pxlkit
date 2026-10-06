'use client';

/* ──────────────────────────────────────────────────────────────────────────
   Shared chart types. The geometry, tone classes and accessible summary of
   the charts live in @pxlkit/ui-kit-core, shared with the Vue and Angular
   kits; the chart components live in their own files and are re-exported
   here so this module's API stays unchanged.
   ────────────────────────────────────────────────────────────────────────── */

export type { ChartSize, PixelChartDataPoint } from '@pxlkit/ui-kit-core';

export { PixelSparkline, type PixelSparklineProps } from './PixelSparkline';
export { PixelBarChart, type PixelBarChartProps } from './PixelBarChart';
export { PixelAreaChart, type PixelAreaChartProps } from './PixelAreaChart';
