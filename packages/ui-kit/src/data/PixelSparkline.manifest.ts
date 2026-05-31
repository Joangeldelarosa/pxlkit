import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSparkline } from './PixelChartPrimitives';
import {
  Default,
  Tones,
  Sizes,
  WithArea,
  Surfaces,
} from './PixelSparkline.examples';

void PixelSparkline;

export default defineManifest({
  name: 'PixelSparkline',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Pure-SVG polyline trend chart that plots a series as a single stroke, with an optional filled area underneath — tone-aware and surface-aware.',
  highlights: [
    'Tone-aware stroke + area fill via retro-* token classes — matches the rest of the kit.',
    'Three sizes (sm/md/lg) with auto-normalized [yMin..yMax] Y scale and even X spread.',
    'Optional showArea fills the area beneath the line at 20% opacity for context.',
    'Surface-aware: pixel uses crispEdges + square caps/miter joins, linear smooths to round.',
    'Zero deps — pure SVG, SSR-safe, tree-shakable.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'with-area', label: 'With Area', Component: WithArea },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['img'],
    keyboard: [],
    notes:
      'The SVG renders as role="img" with an auto-derived aria-label summarizing the trend (kind, point count, min..max range). Pass a custom aria-label for richer narrative context. For full data accessibility, render a visually-hidden <table> sibling with sr-only that mirrors the data points — assistive tech then has a tabular fallback to read.',
  },
  related: ['PixelBarChart', 'PixelAreaChart', 'PixelStatGroup', 'PixelDataTable'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
