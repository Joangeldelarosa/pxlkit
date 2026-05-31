import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBento } from './PixelBento';
import { Default, FourColumns, Cells } from './PixelBento.examples';

export default defineManifest({
  name: 'PixelBento',
  category: 'layout',
  since: '1.7.0',
  status: 'stable',
  description:
    'Bento-style grid container with span- and kind-aware cells for feature, stat, compact, and media layouts.',
  highlights: [
    'Fixed 3 / 4 / 6 column tracks with token-driven gap spacing',
    'PixelBentoCell with span presets (1x1, 2x1, 1x2, 2x2, 3x1, 1x3)',
    'Cell kinds for feature, stat, compact, and media layouts',
    'Tone- and surface-aware cell styling via tokens',
    'forwardRef on both container and cell; SSR-safe div primitives',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'four-columns', label: 'Four Columns', Component: FourColumns },
    { id: 'cells', label: 'Cell Tones', Component: Cells },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['semantic-grid-container'],
    keyboard: [],
    notes:
      'Renders as a <div> grid; authors are responsible for the semantic role of bento cells (heading levels, landmark roles, etc.).',
  },
  related: ['PixelGrid', 'PixelEqualHeightGrid', 'PixelStack', 'PixelCluster'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
