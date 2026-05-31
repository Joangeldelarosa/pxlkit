import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelShake } from './PixelShake';
import { Default, OnHover, StrongShake } from './PixelShake.examples';

export default defineManifest({
  name: 'PixelShake',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Quick horizontal shake animation, ideal for validation errors or attention cues.',
  highlights: [
    'Configurable duration, distance, repeat count, and easing',
    'Trigger on mount, hover, click, focus, in-view, or controlled boolean',
    'Respects prefers-reduced-motion automatically',
    'onComplete callback fires after the final iteration',
    'Forwards ref to the wrapping div',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'on-hover', label: 'On Hover', Component: OnHover },
    { id: 'strong-shake', label: 'Strong Shake', Component: StrongShake },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Animation is automatically disabled when the user has requested reduced motion.',
  },
  related: ['PixelBounce', 'PixelPulse', 'PixelGlitch'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
