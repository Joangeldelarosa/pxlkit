import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelZoomIn } from './PixelZoomIn';
import { Default, CustomStartScale, HoverTrigger } from './PixelZoomIn.examples';

export default defineManifest({
  name: 'PixelZoomIn',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Scales children from a starting scale factor to 1 with a fade-in animation.',
  highlights: [
    'Configurable duration, delay, easing, and start scale',
    'Supports mount, hover, and view-based triggers',
    'Respects prefers-reduced-motion via shared animation hook',
    'Forwards ref to the wrapping div and fires onComplete after final iteration',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'custom-start-scale', label: 'Custom Start Scale', Component: CustomStartScale },
    { id: 'hover-trigger', label: 'Hover Trigger', Component: HoverTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user requests reduced motion.',
  },
  related: ['PixelFadeIn', 'PixelSlideIn'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
