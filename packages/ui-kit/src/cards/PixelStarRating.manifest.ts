import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelStarRating } from './PixelStarRating';
import {
  Default,
  WithCount,
  GreenTone,
  Interactive,
  CustomIcon,
} from './PixelStarRating.examples';

export default defineManifest({
  name: 'PixelStarRating',
  category: 'cards',
  since: '2.0.2',
  status: 'stable',
  description:
    'Pixel-art star rating display with optional interactive selection and surface-aware styling.',
  highlights: [
    'Renders the @pxlkit/gamification Star at 16/20/24px with crisp nearest-neighbour scaling',
    'Gold or green tone tokens for readonly and interactive states, surface-aware via useEffectiveSurface',
    'Optional showCount label renders "N/M" beside the stars',
    'Interactive mode exposes per-star buttons with onChange callback',
    'Polymorphic starIcon prop swaps in any sibling-pack glyph without forking',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-count', label: 'With Count', Component: WithCount },
    { id: 'green-tone', label: 'Green Tone (Large)', Component: GreenTone },
    { id: 'interactive', label: 'Interactive', Component: Interactive },
    { id: 'custom-icon', label: 'Custom Icon (Heart)', Component: CustomIcon },
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
