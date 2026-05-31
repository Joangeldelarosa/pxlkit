import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import { Default, Split, Compact } from './PixelHeroSection.examples'

export default defineManifest({
  name: 'PixelHeroSection',
  category: 'hero',
  since: '1.7.0',
  status: 'stable',
  description:
    'Surface-aware hero section with eyebrow, headline, subline, CTA cluster, install snippet, meta and optional media in centered, split or parallax variants.',
  highlights: [
    'Three variants: centered, split (with media column) and parallax (media behind text)',
    'Density-aware vertical rhythm (compact / comfortable) and tunable min-height',
    'Tone tokens for eyebrow accent + surface-aware typography and transitions',
    'Composable slots: eyebrow, primary/secondary CTA, install, meta and media',
    'Semantic <section> with forwarded ref to HTMLElement',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'split', label: 'Split with media', Component: Split },
    { id: 'compact', label: 'Compact density', Component: Compact },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['semantic <section> with aria-labelledby pointing at headline'],
    keyboard: [],
    notes:
      'Author should set id on the headline and aria-labelledby on the section when the hero acts as a labelled landmark.',
  },
  related: ['PixelHeroMedia', 'PixelContainer', 'PixelTwoColumn', 'PixelCluster'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
