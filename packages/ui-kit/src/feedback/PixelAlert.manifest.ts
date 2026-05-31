import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelAlert } from '../feedback';
import {
  Default,
  Tones,
  Surfaces,
  WithIcon,
  WithAction,
  PoliteLive,
} from './PixelAlert.examples';

void PixelAlert;

export default defineManifest({
  name: 'PixelAlert',
  category: 'feedback',
  since: '1.0.0',
  status: 'stable',
  description:
    'Inline status banner with title, message, tone, optional icon, and action — announces itself to screen readers via role="alert".',
  highlights: [
    'Seven tones (neutral, green, cyan, gold, red, purple, pink) with soft tint + matching border.',
    'Surface-aware: pixel adds a left HP-bar accent stripe and chamfered border; linear stays rounded.',
    'Smart aria-live default — red/gold use "assertive", everything else "polite". Overridable via live prop.',
    'Optional icon and action slots for quick triage (e.g. Retry, Dismiss).',
    'SSR-safe, ref-forwarded, no client state.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'with-icon', label: 'With Icon', Component: WithIcon },
    { id: 'with-action', label: 'With Action', Component: WithAction },
    { id: 'polite-live', label: 'Polite Live Region', Component: PoliteLive },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['alert'],
    notes:
      'Root carries role="alert" and a calculated aria-live (assertive for red/gold, polite otherwise). Icon slot is wrapped purely for layout — meaning must come from the title/message text, not the glyph. For non-urgent status (e.g. "saved"), pass live="polite" to prevent screen-reader interruption. Action buttons are exposed as siblings of the message and receive their own focus order.',
  },
  related: ['PixelToast', 'PixelAlertDialog', 'PixelEmptyState'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
