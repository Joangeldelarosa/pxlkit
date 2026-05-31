import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelHeroMedia } from './PixelHeroMedia';
import { Default, Framed, Square } from './PixelHeroMedia.examples';

export default defineManifest({
  name: 'PixelHeroMedia',
  category: 'hero',
  since: '1.7.0',
  status: 'stable',
  description:
    'Aspect-ratio-preserving figure slot for hero media with optional frame, tone border, and caption.',
  highlights: [
    'Four ratio presets (1/1, 4/5, 16/10, 16/9) reserve layout to prevent CLS',
    'Optional framed border driven by surface + tone tokens',
    'Renders as semantic figure/figcaption when caption is provided',
    'Surface-aware via useEffectiveSurface for light/dark contexts',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'framed', label: 'Framed with caption', Component: Framed },
    { id: 'square', label: 'Square (1:1)', Component: Square },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['figure/figcaption when caption present', 'aspect-ratio reserves layout to avoid CLS'],
    keyboard: [],
    notes: 'Caption is rendered inside a <figcaption> when provided; otherwise the media stands alone inside <figure>.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
