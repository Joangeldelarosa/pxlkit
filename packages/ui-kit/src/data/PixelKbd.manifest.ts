import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelKbd } from '../data-display';
import {
  Default,
  CommonKeys,
  Combo,
  Surfaces,
  InlineInProse,
} from './PixelKbd.examples';

void PixelKbd;

export default defineManifest({
  name: 'PixelKbd',
  category: 'data',
  since: '1.0.0',
  status: 'stable',
  description:
    'Styled keyboard shortcut indicator that renders a native <kbd> element with surface-aware framing for inline docs, hints, and command menus.',
  highlights: [
    'Semantic <kbd> root so assistive tech announces the key role correctly.',
    'Surface-aware: pixel chamfered border + pixel font, or linear pill.',
    'Drop-shadow depth tuned per surface for a tactile keycap feel.',
    'Composable inline — accepts any ReactNode children to support icons or multi-character keys.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'common-keys', label: 'Common Keys', Component: CommonKeys },
    { id: 'combo', label: 'Combo (Ctrl + K)', Component: Combo },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'inline-in-prose', label: 'Inline in Prose', Component: InlineInProse },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['kbd'],
    notes:
      'Renders as a native <kbd> element so screen readers convey the keyboard-input semantic. PixelKbd is presentational (not focusable, not actionable) — pair it with descriptive prose (e.g. "Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open the command palette") so the shortcut is meaningful when read out of context. For key combos, render multiple PixelKbd siblings with a literal "+" separator marked aria-hidden.',
  },
  related: ['PixelCodeInline'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
