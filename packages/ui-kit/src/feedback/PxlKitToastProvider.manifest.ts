import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PxlKitToastProvider } from '../toast';
import {
  Default,
  Tones,
  BottomRight,
  TopCenter,
  Stacked,
  Flat,
  PixelSurface,
  LinearSurface,
  Loading,
  PromiseFlow,
  MaxLimit,
  WithAction,
} from './PxlKitToastProvider.examples';

void PxlKitToastProvider;

export default defineManifest({
  name: 'PxlKitToastProvider',
  category: 'feedback',
  since: '1.8.0',
  status: 'stable',
  description:
    'App-root toast provider that hosts the toast queue, viewport portal, and stacked/expanded visual mode — paired with useToast() for imperative push/update/dismiss/promise APIs.',
  highlights: [
    'Six positions (top/bottom × left/right/center) with portal-rendered viewport.',
    'Sonner-style stacked mode: collapsed cards peek behind the front, hover/focus expands the stack.',
    'Configurable max simultaneous toasts; oldest are dropped when the queue exceeds the cap.',
    'Surface-aware (auto / pixel / linear) — pixel surface adds an HP-bar tone accent to each toast.',
    'Single role="region" landmark announces "Notifications"; per-toast aria-live avoids double announcements.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'bottom-right', label: 'Bottom Right', Component: BottomRight },
    { id: 'top-center', label: 'Top Center', Component: TopCenter },
    { id: 'stacked', label: 'Stacked', Component: Stacked },
    { id: 'flat', label: 'Flat', Component: Flat },
    { id: 'pixel-surface', label: 'Pixel Surface', Component: PixelSurface },
    { id: 'linear-surface', label: 'Linear Surface', Component: LinearSurface },
    { id: 'loading', label: 'Loading → Success', Component: Loading },
    { id: 'promise-flow', label: 'Promise Flow', Component: PromiseFlow },
    { id: 'max-limit', label: 'Max Limit', Component: MaxLimit },
    { id: 'with-action', label: 'With Action', Component: WithAction },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['alert'],
    keyboard: [
      { key: 'Tab', does: 'Move focus into the toast viewport, expanding stacked toasts.' },
      { key: 'Shift+Tab', does: 'Move focus back out of the viewport, collapsing the stack.' },
    ],
    notes:
      'The provider mounts a single role="region" with aria-label="Notifications" as a landmark for the toast viewport. Individual toasts declare their own role (alert for assertive tones like red/gold, status for the rest) with matching aria-live (assertive/polite) and aria-atomic="true", so nesting another aria-live region here is intentionally avoided to prevent double announcements. Hovering or focusing the viewport expands the stacked layout so assistive-tech users can read all queued toasts; focusing inside any toast also pauses its auto-dismiss timer.',
  },
  related: ['PixelToast', 'PixelAlert', 'PixelAlertDialog'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
