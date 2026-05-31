import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelTestimonialCard } from './PixelTestimonialCard';
import {
  Default,
  WithAvatarAndTone,
  CompactQuote,
} from './PixelTestimonialCard.examples';

void PixelTestimonialCard;

export default defineManifest({
  name: 'PixelTestimonialCard',
  category: 'cards',
  since: '1.7.0',
  status: 'stable',
  description:
    'Surface-aware testimonial card with quote, attribution, avatar, star rating and verified badge.',
  highlights: [
    'Semantic article + blockquote markup for accessible social proof',
    'Tone tokens drive avatar + accents; surface adapts borders, radii and fonts',
    'Optional star rating and VERIFIED badge for trust signals',
    'Three quote-size presets (compact / normal / long) keep card grids aligned',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    {
      id: 'with-avatar-and-tone',
      label: 'With avatar + tone',
      Component: WithAvatarAndTone,
    },
    { id: 'compact-quote', label: 'Compact quote', Component: CompactQuote },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['semantic blockquote + cite', 'figure/figcaption for quote variant'],
    keyboard: [],
    notes:
      'Renders as <article> with a <blockquote> for the testimonial body; verified badge exposes an aria-label.',
  },
  related: ['PixelStarRating'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
