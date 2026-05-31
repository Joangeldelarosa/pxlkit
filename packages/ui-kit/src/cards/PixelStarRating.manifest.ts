import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelStarRating } from './PixelStarRating';
import {
  Default,
  WithCount,
  GreenTone,
  Interactive,
} from './PixelStarRating.examples';

export default defineManifest({
  name: 'PixelStarRating',
  category: 'cards',
  since: '1.7.0',
  status: 'stable',
  description:
    'Pixel-art star rating display with optional interactive selection and surface-aware styling.',
  highlights: [
    'Crisp 8x8 pixel star SVGs that scale across sm/md/lg sizes',
    'Gold or green tone tokens for readonly and interactive states',
    'Optional showCount label renders "N/M" beside the stars',
    'Interactive mode exposes per-star buttons with onChange callback',
    'Surface-aware via useEffectiveSurface for consistent font rendering',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-count', label: 'With Count', Component: WithCount },
    { id: 'green-tone', label: 'Green Tone (Large)', Component: GreenTone },
    { id: 'interactive', label: 'Interactive', Component: Interactive },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'role=img with aria-label="N out of M" for readonly display',
      'role=group with per-star buttons (aria-pressed) for interactive mode',
    ],
    keyboard: [
      {
        key: 'Tab',
        does: 'Moves focus through interactive star buttons',
        when: 'interactive=true',
      },
      {
        key: 'Enter / Space',
        does: 'Activates the focused star button to set the rating',
        when: 'interactive=true',
      },
    ],
    notes:
      'Interactive mode exposes each star as a button with aria-pressed reflecting filled state; readonly mode collapses to a single aria-labeled image.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
