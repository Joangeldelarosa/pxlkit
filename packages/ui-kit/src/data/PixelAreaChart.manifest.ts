import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelAreaChart } from './PixelChartPrimitives';
import {
  Default,
  Tones,
  Sizes,
  Smooth,
  Surfaces,
} from './PixelAreaChart.examples';

void PixelAreaChart;

export default defineManifest({
  name: 'PixelAreaChart',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Pure-SVG filled area chart that closes the trend polyline down to the baseline, with crisp pixel edges or smoothed linear joins.',
  highlights: [
    'Tone-aware stroke + fill via retro-* token classes — matches the rest of the kit.',
    'Three sizes (sm/md/lg) with consistent inner padding and baseline math.',
    'Surface-aware: pixel uses crispEdges + miter joins, linear can smooth via the smooth prop.',
    'Polygon stays polygonal (no curves) so pixel surface remains pixel-perfect.',
    'Auto-normalized [yMin..yMax] scale handles any numeric series.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'smooth', label: 'Smooth', Component: Smooth },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['img'],
    keyboard: [],
    notes:
      'The SVG renders as role="img" with an auto-derived aria-label summarizing the series (kind, count, min..max range). Pass a custom aria-label for richer context. For full data accessibility, render a visually-hidden <table> sibling with sr-only that mirrors the data points — assistive tech then has a tabular fallback to read.',
  },
  related: ['PixelSparkline', 'PixelBarChart', 'PixelStatGroup', 'PixelDataTable'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
