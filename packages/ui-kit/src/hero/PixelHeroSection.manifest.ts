import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import { Default, Split, Compact, TypewriterHeadline, GlitchHeadline, HeadingLevel } from './PixelHeroSection.examples'

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
    'Semantic <section> whose headline level is yours to set (`as`, h1 by default)',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'split', label: 'Split with media', Component: Split },
    { id: 'compact', label: 'Compact density', Component: Compact },
    { id: 'typewriter-headline', label: 'Typewriter headline', Component: TypewriterHeadline },
    { id: 'glitch-headline', label: 'Glitch headline', Component: GlitchHeadline },
    { id: 'heading-level', label: 'Heading level', Component: HeadingLevel },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['region'],
    keyboard: [],
    notes:
      'Renders a `<section>` whose headline is the page\'s `<h1>`, or the level `as` sets for a hero embedded under the page\'s own `<h1>`. The headline is one heading with every effect: the glitch\'s colour copies are `aria-hidden` spans inside it. A section is a landmark only once it has an accessible name: give the hero an `aria-label` (it reaches the `<section>`) when it should be one, for instance on a page with several landmarks.',
  },
  related: ['PixelHeroMedia', 'PixelContainer', 'PixelTwoColumn', 'PixelCluster'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
