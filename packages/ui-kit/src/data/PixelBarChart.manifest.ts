import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBarChart } from './PixelChartPrimitives';
import {
  Default,
  Tones,
  Sizes,
  Horizontal,
  WithValues,
  Surfaces,
} from './PixelBarChart.examples';

void PixelBarChart;

export default defineManifest({
  name: 'PixelBarChart',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Pure-SVG bar chart that renders one rect per data point, in vertical (default) or horizontal orientation, with crisp pixel edges or smoothed linear corners.',
  highlights: [
    'Tone-aware fills via retro-* token classes — matches the rest of the kit.',
    'Three sizes (sm/md/lg) with sensible inner padding and gap math.',
    'Vertical or horizontal orientation with auto-normalized [yMin..yMax] scale.',
    'Optional inline value labels above (vertical) or after (horizontal) each bar.',
    'Surface-aware: pixel uses crispEdges + square corners, linear smooths to rx=2.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'horizontal', label: 'Horizontal', Component: Horizontal },
    { id: 'with-values', label: 'With Values', Component: WithValues },
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
  related: ['PixelSparkline', 'PixelAreaChart', 'PixelStatGroup', 'PixelDataTable'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
