import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelParallaxGroup } from './PixelParallaxGroup';
import { Default, AsSection } from './PixelParallaxGroup.examples';

void PixelParallaxGroup;

export default defineManifest({
  name: 'PixelParallaxGroup',
  category: 'parallax',
  since: '1.6.0',
  status: 'stable',
  description:
    'Perspective/viewport container that clips parallax children within a shared overflow-hidden, relative-positioned area.',
  highlights: [
    'Establishes a shared viewport for parallax layers',
    'Applies position: relative and overflow: hidden automatically',
    'Polymorphic tag: div, section, header, or main',
    'Forwarded ref for imperative access',
    'SSR-safe — no measurement or window APIs',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'as-section', label: 'As Section', Component: AsSection },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['decorative container'],
    keyboard: [],
    notes:
      'Purely a layout/clipping container; children handle motion and respect prefers-reduced-motion individually.',
  },
  related: ['PixelParallaxLayer', 'PixelMouseParallax'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
