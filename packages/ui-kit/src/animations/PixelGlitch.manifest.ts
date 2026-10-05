import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelGlitch } from './PixelGlitch';
import { Default, HeadingLabel, HighIntensity, HoverTrigger } from './PixelGlitch.examples';

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
    'Animation trigger modes: mount, hover, click, focus, in-view, manual',
    'Holds still when the user prefers reduced motion, from the server-rendered first paint on',
    'Glitches any content, or a label held once in the document for a heading: its copies are drawn by CSS',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'high-intensity', label: 'High intensity', Component: HighIntensity },
    { id: 'hover-trigger', label: 'Hover trigger', Component: HoverTrigger },
    {
      id: 'heading-label',
      label: 'Heading label',
      description:
        'A label glitches with its text once in the document: the copies are drawn by the stylesheet, so a heading reads once to crawlers, copying and screen readers. Put the heading around the glitch, as a span.',
      Component: HeadingLabel,
    },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'aria-hidden on decorative ghost layers',
      'a label\'s copies drawn by CSS, without alternative text',
      'respects prefers-reduced-motion',
    ],
    keyboard: [],
    notes:
      'The copies of other content are layers marked aria-hidden, so assistive technology reads the content once, though it is in the document three times. A label is in the document once: its copies are drawn by the stylesheet, with no alternative text for assistive technology — use one for a heading. Animation is suppressed when the user prefers reduced motion.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
