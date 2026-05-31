import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCluster } from './PixelCluster';
import { Default, Justified, PixelSurface } from './PixelCluster.examples';

export default defineManifest({
  name: 'PixelCluster',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Horizontal wrap container for clustering inline items (chips, tags, actions) with consistent gap, alignment, and justification.',
  highlights: [
    'Flex row with wrap and configurable stack gap token',
    'Surface-aware via useEffectiveSurface for transitions',
    'Polymorphic via `as` to render as any intrinsic element',
    'Align and justify props mirror flexbox semantics',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'justified', label: 'Justified', Component: Justified },
    { id: 'pixel-surface', label: 'Pixel Surface', Component: PixelSurface },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['polymorphic-wrap-container'],
    keyboard: [],
    notes:
      'Polymorphic wrap container; inherits semantics from `as`. Defaults to <div> with no implicit role.',
  },
  related: ['PixelStack', 'PixelGrid'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
