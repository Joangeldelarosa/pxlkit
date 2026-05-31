import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSlideIn } from './PixelSlideIn';
import { Default, FromLeft, OnHover } from './PixelSlideIn.examples';

export default defineManifest({
  name: 'PixelSlideIn',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Translates children in from one of four edges with configurable distance, duration, and trigger.',
  highlights: [
    'Slide from up, down, left, or right edges',
    'Mount, hover, click, or in-view triggers',
    'Configurable duration, delay, distance, easing, and fill-mode',
    'Iteration count supports finite or infinite repeats',
    'Respects prefers-reduced-motion via useReducedMotion',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'from-left', label: 'From Left', Component: FromLeft },
    { id: 'on-hover', label: 'On Hover', Component: OnHover },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user prefers reduced motion.',
  },
  related: ['PixelFadeIn', 'PixelZoomIn', 'PixelBounce'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
