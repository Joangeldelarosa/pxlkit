import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PxlKitToastProvider } from './PxlKitToastProvider';
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
  PromiseRejected,
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
    'App-root toast provider that hosts the toast queue, viewport portal, and stacked/expanded visual mode — paired with useToast() (injectToast() in Angular) for imperative push/update/dismiss/promise APIs.',
  highlights: [
    'Six positions (top/bottom × left/right/center) with portal-rendered viewport.',
    'Sonner-style stacked mode: collapsed cards peek behind the front, hover/focus expands the stack.',
    'Configurable max simultaneous toasts; oldest are dropped when the queue exceeds the cap.',
    'Surface-aware (auto / pixel / linear) — pixel surface adds an HP-bar tone accent to each toast.',
    'Announced through two persistent live regions, polite and assertive; F8 moves focus to the toasts, and `duration` sets or turns off their auto-dismiss.',
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
    { id: 'promise-rejected', label: 'Promise Rejected', Component: PromiseRejected },
    { id: 'max-limit', label: 'Max Limit', Component: MaxLimit },
    { id: 'with-action', label: 'With Action', Component: WithAction },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['region', 'status', 'alert'],
    keyboard: [
      {
        key: 'F8',
        does: 'Move focus to the toast viewport, expanding stacked toasts.',
        when: 'Toasts on screen; another key, or none, with `hotkey`.',
      },
      { key: 'Tab', does: "Move through the toasts' action and dismiss buttons, from the viewport or the page, expanding stacked toasts." },
      { key: 'Shift+Tab', does: 'Move focus back through the toasts and out of the viewport, collapsing the stack.' },
      {
        key: 'Enter',
        does: "Dismiss the toast; focus moves to the next toast's dismiss button, or the previous one's, or back to where it came from.",
        when: 'Dismiss button focused.',
      },
    ],
    notes:
      'The viewport is a `role="region"` landmark named after its hotkey — "Notifications (F8)" by default; `hotkey` sets another key or, with `false`, none — and takes focus from it (`tabindex="-1"`), from where Tab reaches the toasts\' buttons. The hotkey works in text fields too, since F8 types nothing. Two visually hidden live regions inside the viewport, there and empty before any toast, announce the toasts: each toast\'s title and message are written to `role="status"` — or `role="alert"` for critical tones (red, gold) and `assertive` toasts — when it is pushed and when an update changes its title, message or tone (a settled promise), as new content each time, so a repeated message is read again. The cards themselves are not live regions. Toasts dismiss themselves after the provider\'s `duration` (4.5 s; `0` keeps them until dismissed, WCAG 2.2.1), a promise\'s error toast after at least 6 s; a toast\'s countdown holds while it is hovered or focused, while the page is hidden and while the window is in the background. Hovering or focusing the viewport expands the stacked layout. When the toast holding focus leaves, focus moves to the dismiss button of the next toast, else the previous one, else back to the element it entered the viewport from.',
  },
  related: ['PixelToast', 'PixelAlert', 'PixelAlertDialog'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
