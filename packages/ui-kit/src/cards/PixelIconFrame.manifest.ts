import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelIconFrame } from './PixelIconFrame';
import { Default, Tones, Sizes, Shapes, WithAccent } from './PixelIconFrame.examples';

export default defineManifest({
  name: 'PixelIconFrame',
  category: 'cards',
  since: '1.7.0',
  status: 'stable',
  description: 'Decorative icon container with surface-aware borders, tone tinting, sizes, shapes, and an optional accent badge.',
  highlights: [
    'Five fixed sizes (48 / 56 / 64 / 80 / 112) for consistent layout rhythm',
    'Seven tone keys driven by shared tokens for soft tinted backgrounds',
    'Square, rounded, and circle shapes that respect surface radius',
    'Optional accent badge slot (top-right or bottom-right)',
    'Respects prefers-reduced-motion when animated',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'shapes', label: 'Shapes', Component: Shapes },
    { id: 'with-accent', label: 'With Accent', Component: WithAccent },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['decorative wrapper'],
    keyboard: [],
    notes: 'Inner icon and accent are aria-hidden. Provide an accessible label on a parent element when the frame conveys meaning.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
