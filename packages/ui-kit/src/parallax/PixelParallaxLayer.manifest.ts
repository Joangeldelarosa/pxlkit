import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelParallaxLayer } from './PixelParallaxLayer';
import { Default, Foreground, Horizontal } from './PixelParallaxLayer.examples';

void PixelParallaxLayer;

export default defineManifest({
  name: 'PixelParallaxLayer',
  category: 'parallax',
  since: '1.6.0',
  status: 'stable',
  description:
    'Scroll-driven parallax wrapper that GPU-translates its children proportionally to scroll position.',
  highlights: [
    'GPU-composited via translate3d for smooth 60fps motion',
    'Configurable speed multiplier (negative values reverse direction)',
    'Supports x, y, or both axes',
    'Ref-forwarding to underlying div',
  ],
  examples: [
    { id: 'default', label: 'Default (background)', Component: Default },
    { id: 'foreground', label: 'Foreground (reverse)', Component: Foreground },
    { id: 'horizontal', label: 'Horizontal axis', Component: Horizontal },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion', 'decorative layer'],
    keyboard: [],
    notes:
      'Parallax is decorative; consumers should gate motion or apply aria-hidden on purely decorative layers.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
