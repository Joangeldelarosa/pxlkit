import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  Palette,
  Surfaces,
  SurfaceTokens,
} from './PixelColorSwatch.examples';

export default defineManifest({
  name: 'PixelColorSwatch',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Design-token preview tile that renders a CSS custom property as a color sample alongside its human name and variable identifier.',
  highlights: [
    'Pairs a 32px color chip with token name + CSS variable label for at-a-glance audits',
    'Reads the color directly from a CSS custom property so it stays in sync with the active theme',
    'Pixel + linear surface variants share identical API and tokenized geometry',
    'Pure presentational primitive — SSR-safe and side-effect free',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'palette', label: 'Palette', Component: Palette },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'surface-tokens', label: 'Surface Tokens', Component: SurfaceTokens },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['img'],
    notes:
      'Non-interactive presentational block. The visible token name + cssVar string provide the textual description of the color sample for screen readers; no separate alt text is required because the chip itself carries no semantic meaning beyond the adjacent label.',
  },
  related: ['PixelColorInput'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
