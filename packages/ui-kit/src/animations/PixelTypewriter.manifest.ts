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
    patterns: ['aria-live=polite for incremental text', 'respects prefers-reduced-motion'],
    keyboard: [],
    notes: 'Caret is decorative; full text is exposed to assistive tech once typing completes.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
