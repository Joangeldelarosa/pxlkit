import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelStack } from './PixelStack';
import {
  Default,
  Row,
  SpaceBetween,
  Wrapped,
  PixelSurface,
} from './PixelStack.examples';

export default defineManifest({
  name: 'PixelStack',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Polymorphic flex container with token-driven gap, direction, alignment, and surface-aware transitions.',
  highlights: [
    'Direction toggle between column and row flex layouts',
    'Token-based gap scale via stackGap for consistent rhythm',
    'Alignment and justification helpers including baseline and space variants',
    'Surface-aware transitions through useEffectiveSurface',
    'Polymorphic via the `as` prop to render any intrinsic element',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'row', label: 'Row', Component: Row },
    { id: 'space-between', label: 'Space Between', Component: SpaceBetween },
    { id: 'wrapped', label: 'Wrapped', Component: Wrapped },
    { id: 'pixel-surface', label: 'Pixel Surface', Component: PixelSurface },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['polymorphic-flex-container'],
    keyboard: [],
    notes:
      'Renders as <div> by default; inherits semantics from the `as` prop when overridden.',
  },
  related: ['PixelCluster', 'PixelGrid', 'PixelCenter'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
