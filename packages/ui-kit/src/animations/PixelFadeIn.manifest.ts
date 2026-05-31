import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelFadeIn } from './PixelFadeIn';
import { Default, Delayed, OnHover } from './PixelFadeIn.examples';

export default defineManifest({
  name: 'PixelFadeIn',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Fades children from opacity 0 to 1 with configurable duration, delay, easing, and trigger.',
  highlights: [
    'Mount, hover, click, or in-view triggers',
    'Configurable duration, delay, easing, and fill-mode',
    'Iteration count supports finite or infinite repeats',
    'onComplete callback fires after the final iteration',
    'Respects prefers-reduced-motion via useReducedMotion',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'delayed', label: 'Delayed', Component: Delayed },
    { id: 'on-hover', label: 'On Hover', Component: OnHover },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user prefers reduced motion.',
  },
  related: ['PixelSlideIn', 'PixelScaleIn', 'PixelBlurIn'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
