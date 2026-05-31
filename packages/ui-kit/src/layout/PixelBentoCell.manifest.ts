import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBentoCell } from './PixelBento';
import { Default, Tones, MediaCell } from './PixelBentoCell.examples';

export default defineManifest({
  name: 'PixelBentoCell',
  category: 'layout',
  since: '1.7.0',
  status: 'stable',
  description:
    'Surface-aware bento grid cell with span, kind layout, and tone tokens for dashboard collages.',
  highlights: [
    'Span tokens (1x1, 2x1, 1x2, 2x2, 3x1, 1x3) for collage layouts',
    'Kind presets (feature / stat / compact / media) drive internal flex layout',
    'Tone-aware border + background + text via shared token system',
    'Surface-aware (retro / pixel) via useEffectiveSurface',
    'Pairs with PixelBento parent grid for column + gap control',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'media-cell', label: 'Media Cell', Component: MediaCell },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['polymorphic-cell'],
    keyboard: [],
    notes:
      'Inherits semantics from the rendered element. Provide aria-label or wrap with semantic landmarks (section, article) when the cell carries standalone meaning.',
  },
  related: ['PixelBento', 'PixelBox', 'PixelGrid'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
