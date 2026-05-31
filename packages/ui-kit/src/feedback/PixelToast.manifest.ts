import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelToast } from '../toast';
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
    'Auto-dismiss with a visual progress bar; hover/focus pauses the countdown.',
    'Smart aria semantics — assertive role=alert for red/gold by default, polite role=status otherwise; overridable per toast.',
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
    patterns: ['alert'],
    keyboard: [
      { key: 'Tab', does: 'Move focus into the toast (action button, then dismiss button).' },
      { key: 'Enter', does: 'Activate the focused action or dismiss button.', when: 'Action or dismiss button focused.' },
      { key: 'Space', does: 'Activate the focused action or dismiss button.', when: 'Action or dismiss button focused.' },
    ],
    notes:
      'Each card declares its own role (alert for assertive tones like red/gold, status for the rest) plus matching aria-live and aria-atomic="true" so screen readers announce title + message together. Hovering or focusing the card pauses the auto-dismiss timer to give assistive-tech users time to read. The dismiss button has aria-label="Dismiss notification" and a visible focus ring. The parent PxlKitToastProvider hosts a single role="region" landmark — toasts should not be nested inside another aria-live region to avoid double announcements.',
  },
  related: ['PxlKitToastProvider', 'PixelAlert', 'PixelAlertDialog'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
