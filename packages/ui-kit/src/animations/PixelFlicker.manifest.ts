import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelFlicker } from './PixelFlicker';
import { Default, FasterFlicker, HoverTrigger } from './PixelFlicker.examples';

export default defineManifest({
  name: 'PixelFlicker',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Broken-neon-sign opacity flicker loop for retro signage and emphasis.',
  highlights: [
    'Stepped opacity flicker that mimics a broken neon sign',
    'Configurable duration and repeat count',
    'Trigger modes: mount, hover, click, focus, inView, or controlled',
    'Forwards refs and merges with internal trigger observers',
    'Respects prefers-reduced-motion automatically',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'faster-flicker', label: 'Faster Flicker', Component: FasterFlicker },
    { id: 'hover-trigger', label: 'Hover Trigger', Component: HoverTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is suppressed when the user has requested reduced motion.',
  },
  related: ['PixelGlitch', 'PixelPulse', 'PixelShake'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
