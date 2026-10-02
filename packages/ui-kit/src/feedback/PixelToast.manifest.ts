import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelToast } from './PixelToast';
import {
  Default,
  Tones,
  Surfaces,
  Loading,
  WithAction,
  WithIcon,
  Assertive,
  WithProgress,
} from './PixelToast.examples';

void PixelToast;

export default defineManifest({
  name: 'PixelToast',
  category: 'feedback',
  since: '1.0.0',
  status: 'stable',
  description:
    'Single toast notification card with title, message, tone, optional icon/action, loading spinner, and an auto-dismiss countdown bar — usually rendered by PxlKitToastProvider via useToast().',
  highlights: [
    'Seven tones with matching border, text color, and HP-bar accent on pixel surface.',
    'Auto-dismiss with a visual progress bar; hover, focus, a hidden page or a background window pause the countdown.',
    'Announced by PxlKitToastProvider — assertively for red/gold by default, politely otherwise; overridable per toast.',
    'Optional leading slot for icon, animatedIcon, or built-in loading spinner.',
    'Action slot for inline retry / undo buttons; dismiss button always present.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'loading', label: 'Loading', Component: Loading },
    { id: 'with-action', label: 'With Action', Component: WithAction },
    { id: 'with-icon', label: 'With Icon', Component: WithIcon },
    { id: 'assertive', label: 'Assertive', Component: Assertive },
    { id: 'with-progress', label: 'Auto-dismiss Progress', Component: WithProgress },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [],
    keyboard: [
      { key: 'Tab', does: 'Move focus into the toast (action button, then dismiss button).' },
      { key: 'Enter', does: 'Activate the focused action or dismiss button.', when: 'Action or dismiss button focused.' },
      { key: 'Space', does: 'Activate the focused action or dismiss button.', when: 'Action or dismiss button focused.' },
    ],
    notes:
      'The card is not a live region: `PxlKitToastProvider` announces each toast — its title and message — in the two live regions of its viewport, assertively (`role="alert"`) for critical tones like red/gold or `assertive` toasts, politely (`role="status"`) for the rest. A card rendered on its own is not announced. Hovering or focusing the card holds its auto-dismiss countdown, and so do a hidden page and a window in the background, to give everyone time to read it (WCAG 2.2.1). The dismiss button has `aria-label="Dismiss notification"` and a visible focus ring.',
  },
  related: ['PxlKitToastProvider', 'PixelAlert', 'PixelAlertDialog'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
