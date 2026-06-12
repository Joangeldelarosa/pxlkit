import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, FastCyan, NoCursor, OnView } from './PixelTypewriter.examples';

export default defineManifest({
  name: 'PixelTypewriter',
  category: 'animations',
  since: '1.6.0',
  status: 'stable',
  description: 'Types out a string one character at a time with an optional blinking caret.',
  highlights: [
    'Configurable speed, delay, and blinking caret',
    'Tone-aware text color via shared tone tokens',
    'Animation trigger modes: mount, view, hover, click',
    'onComplete callback fires when full text is rendered',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'fast-cyan', label: 'Fast (cyan)', Component: FastCyan },
    { id: 'no-cursor', label: 'No cursor', Component: NoCursor },
    { id: 'on-view', label: 'On view', Component: OnView },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['respects prefers-reduced-motion'],
    keyboard: [],
    notes:
      'Caret and the character-by-character animation are aria-hidden; the complete string is exposed to assistive tech from the first render via a visually hidden span. When the user prefers reduced motion, the typing animation is skipped: the full text renders immediately and onComplete fires once.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
