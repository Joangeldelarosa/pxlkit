import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelTimeline } from './PixelTimeline';
import { Default, Dashed, RightAligned } from './PixelTimeline.examples';

void PixelTimeline;

export default defineManifest({
  name: 'PixelTimeline',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description: 'Vertical timeline rendered as a semantic ordered list with past/active/upcoming states and surface-aware bullets and connectors.',
  highlights: [
    'Semantic <ol>/<li> with aria-current="step" on the active entry',
    'Configurable bullet size, alignment, and per-item connector variant (solid/dashed/dotted)',
    'Surface-aware (pixel/glass/solid) styling via shared surface tokens',
    'Connector lines marked aria-hidden so screen readers ignore decoration',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'dashed', label: 'Dashed connectors', Component: Dashed },
    { id: 'right-aligned', label: 'Right aligned', Component: RightAligned },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['semantic ol/li', 'aria-current="step" on active item', 'connectors aria-hidden'],
    keyboard: [],
    notes: 'Decorative bullets and connector rails are aria-hidden; entry state is exposed via aria-current on the active <li>.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
