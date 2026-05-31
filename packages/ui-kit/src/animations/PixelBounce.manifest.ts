import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBounce } from './PixelBounce';
import { Default, TallerBounce, HoverTrigger } from './PixelBounce.examples';

export default defineManifest({
  name: 'PixelBounce',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Vertical bounce animation with damped follow-through for any inline content.',
  highlights: [
    'Configurable bounce height, duration, easing, and repeat count',
    'Trigger modes: mount, hover, focus, viewport',
    'Forwards refs and merges with internal trigger observers',
    'Respects prefers-reduced-motion automatically',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'taller-bounce', label: 'Taller Bounce', Component: TallerBounce },
    { id: 'hover-trigger', label: 'Hover Trigger', Component: HoverTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user has requested reduced motion.',
  },
  related: ['PixelShake', 'PixelPulse', 'PixelFloat'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
