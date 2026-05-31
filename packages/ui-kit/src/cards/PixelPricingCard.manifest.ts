import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, Popular } from './PixelPricingCard.examples';

export default defineManifest({
  name: 'PixelPricingCard',
  category: 'cards',
  since: '1.7.0',
  status: 'stable',
  description:
    'Pricing tier card with tone-driven highlight, optional popular ribbon, feature list, and CTA slot.',
  highlights: [
    'Surface-aware borders, fonts, and radii via useEffectiveSurface',
    'Tone tokens drive price color, highlight glow, and feature checks',
    'Optional popular ribbon with its own tone override',
    'Feature list supports included/excluded states with tooltip + a11y labels',
    'Strikethrough price exposed to assistive tech via sr-only label',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'popular', label: 'Popular (highlighted)', Component: Popular },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['semantic article'],
    keyboard: [],
    notes:
      'Renders as <article>. Strikethrough price and excluded features are announced via sr-only labels. CTA inherits its own a11y from the consumer-provided node.',
  },
  related: ['PixelCard', 'PixelFeatureCard'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
