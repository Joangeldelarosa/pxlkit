import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelGlitch } from './PixelGlitch';
import { Default, HighIntensity, HoverTrigger } from './PixelGlitch.examples';

export default defineManifest({
  name: 'PixelGlitch',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description:
    'Three-layer glitch effect (R/C ghost layers + main) with clip-path slices and color separation.',
  highlights: [
    'Layered R/C color-separation ghosts for authentic CRT-glitch feel',
    'Configurable duration and horizontal displacement intensity',
    'Animation trigger modes: mount, hover, in-view, manual',
    'Respects prefers-reduced-motion via shared animation hooks',
    'SSR-safe forwardRef wrapper around any children',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'high-intensity', label: 'High intensity', Component: HighIntensity },
    { id: 'hover-trigger', label: 'Hover trigger', Component: HoverTrigger },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'aria-hidden on decorative ghost layers',
      'respects prefers-reduced-motion',
    ],
    keyboard: [],
    notes:
      'Ghost layers are marked aria-hidden so assistive tech reads only the underlying content. Animation is suppressed when the user prefers reduced motion.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
