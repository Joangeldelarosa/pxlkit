import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelMouseParallax } from './PixelMouseParallax';
import { Default, Inverted } from './PixelMouseParallax.examples';

export default defineManifest({
  name: 'PixelMouseParallax',
  category: 'parallax',
  since: '1.6.0',
  status: 'stable',
  description:
    'Cursor-tracking parallax layer that translates children based on mouse position with smooth lerp.',
  highlights: [
    'Smoothed translate3d follow with configurable strength',
    'Invert mode to repel children from the cursor',
    'GPU-accelerated via will-change-transform',
    'Forwards ref to the underlying div',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'inverted', label: 'Inverted', Component: Inverted },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['decorative-motion'],
    keyboard: [],
    notes:
      'Pointer-only effect with no keyboard or assistive impact. Honor prefers-reduced-motion at the page level when wrapping critical content.',
  },
  related: ['PixelParallaxGroup', 'PixelParallaxLayer', 'PixelScrollParallax'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
