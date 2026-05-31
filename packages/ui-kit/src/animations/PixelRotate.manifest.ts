import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelRotate } from './PixelRotate';
import { Default, ReverseDirection, HoverTrigger } from './PixelRotate.examples';

export default defineManifest({
  name: 'PixelRotate',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Full 360° rotation loop with configurable direction, duration, and trigger.',
  highlights: [
    'Configurable duration, easing, repeat count, and animation direction',
    'Trigger modes: mount, hover, focus, viewport',
    'Forwards refs and merges with internal trigger observers',
    'Respects prefers-reduced-motion automatically',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'reverse-direction', label: 'Reverse Direction', Component: ReverseDirection },
    { id: 'hover-trigger', label: 'Hover Trigger', Component: HoverTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user has requested reduced motion.',
  },
  related: ['PixelFloat', 'PixelPulse', 'PixelBounce'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
