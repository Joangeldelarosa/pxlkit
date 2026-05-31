import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelRibbon } from './PixelRibbon';
import {
  Default,
  CornerTilted,
  Tones,
  PositionLeft,
} from './PixelRibbon.examples';

export default defineManifest({
  name: 'PixelRibbon',
  category: 'cards',
  since: '1.7.0',
  status: 'stable',
  description:
    'Absolutely-positioned decorative ribbon for cards — surface-aware, tone-driven, with corner-tilt presets.',
  highlights: [
    'Five position presets (top-center/left/right, corner-tl/tr)',
    'Tone palette via shared ToneKey tokens',
    'Auto-tilt on corner positions with manual override',
    'Surface-aware borders, radius and display font',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'corner-tilted', label: 'Corner tilted', Component: CornerTilted },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'position-left', label: 'Position left', Component: PositionLeft },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'Decorative text node — wrap in role=img with aria-label when content is purely visual',
      'pointer-events: none ensures the ribbon never intercepts card interactions',
    ],
    keyboard: [],
    notes:
      'Ribbon is non-interactive; pair its message with the card heading so screen readers still convey the badge meaning.',
  },
  related: ['PixelBadge', 'PixelCard'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
