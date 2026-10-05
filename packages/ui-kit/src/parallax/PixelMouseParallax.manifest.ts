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
    'Invert mode to repel its content from the cursor',
    'GPU-accelerated via will-change-transform',
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
      'Pointer-only effect with no keyboard or assistive impact. The layer holds still when the user prefers reduced motion (`prefers-reduced-motion: reduce`), and stops where it is if the preference turns on while it moves.',
  },
  related: ['PixelParallaxGroup', 'PixelParallaxLayer', 'PixelScrollParallax'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
