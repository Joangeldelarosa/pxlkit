import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelPulse } from './PixelPulse';
import { Default, FasterPulse, HoverTrigger } from './PixelPulse.examples';

export default defineManifest({
  name: 'PixelPulse',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Gently scales and dims children in a recurring pulse to draw attention.',
  highlights: [
    'Configurable duration, easing, and repeat count',
    'Trigger modes: mount, hover, click, focus, inView, or controlled',
    'Forwards refs and merges with internal trigger observers',
    'Respects prefers-reduced-motion automatically',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'faster-pulse', label: 'Faster Pulse', Component: FasterPulse },
    { id: 'hover-trigger', label: 'Hover Trigger', Component: HoverTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user has requested reduced motion.',
  },
  related: ['PixelBounce', 'PixelFlicker', 'PixelGlitch'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
