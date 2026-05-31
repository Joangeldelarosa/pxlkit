import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelFloat } from './PixelFloat';
import { Default, FartherTravel, HoverTrigger } from './PixelFloat.examples';

export default defineManifest({
  name: 'PixelFloat',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Gentle vertical sine loop, perfect for hero badges and floating accents.',
  highlights: [
    'Configurable travel distance, duration, easing, and repeat count',
    'Trigger modes: mount, hover, focus, viewport',
    'Forwards refs and merges with internal trigger observers',
    'Respects prefers-reduced-motion automatically',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'farther-travel', label: 'Farther Travel', Component: FartherTravel },
    { id: 'hover-trigger', label: 'Hover Trigger', Component: HoverTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user has requested reduced motion.',
  },
  related: ['PixelBounce', 'PixelPulse', 'PixelFadeIn'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
