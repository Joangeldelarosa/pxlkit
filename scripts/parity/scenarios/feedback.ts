import type { ParityScenario } from '../interact';

const trigger = '[data-parity-root] button';
const viewport = '[data-pxl-toast-viewport]';
const dismiss = '[data-pxl-toast] button[aria-label="Dismiss notification"]';
const action = '[data-pxl-toast] button:not([aria-label])';
// The examples settle their pending toasts 1 s after the click, and a toast
// dismisses itself after its default 4.5 s; the waits outlast both by a wide
// margin.
const settle = { action: 'wait', ms: 1500 } as const;
const expire = { action: 'wait', ms: 5000 } as const;

// A toast holds its countdown while hovered or focused, and the bar then
// shows the share of time left — which depends on the clock. The scenarios
// hold only toasts that are not counting down (loading ones, or cards without
// a duration), and hover the viewport rather than the toasts in it.
export const scenarios: ParityScenario[] = [
  {
    component: 'PxlKitToastProvider',
    example: 'Default',
    name: 'pushes a toast into the viewport, dismisses it from its button and pushes another',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: dismiss },
      { action: 'click', target: trigger },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Default',
    name: 'dismisses the toast once its duration has passed, hovered viewport or not',
    steps: [
      { action: 'click', target: trigger },
      { action: 'hover', target: viewport },
      expire,
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Tones',
    name: 'pushes a toast per tone shortcut, announcing the critical ones as alerts, and stacks them',
    steps: [
      { action: 'click', target: trigger, nth: 0 },
      { action: 'click', target: trigger, nth: 1 },
      { action: 'click', target: trigger, nth: 2 },
      { action: 'click', target: trigger, nth: 3 },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Stacked',
    name: 'collapses the toasts into a stack, expands it while hovered and collapses it again',
    steps: [
      { action: 'click', target: trigger },
      { action: 'hover', target: viewport },
      { action: 'unhover', target: viewport },
      { action: 'click', target: trigger },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Stacked',
    name: 'dismisses a toast from an expanded stack and collapses once the pointer leaves',
    steps: [
      { action: 'click', target: trigger },
      { action: 'hover', target: viewport },
      { action: 'click', target: dismiss, nth: 1 },
      { action: 'unhover', target: viewport },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Flat',
    name: 'lists the toasts without collapsing them, hovered or not',
    steps: [
      { action: 'click', target: trigger },
      { action: 'hover', target: viewport },
      { action: 'unhover', target: viewport },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'BottomRight',
    name: 'stacks from the bottom edge with the newest toast in front',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: trigger },
      { action: 'click', target: trigger },
      { action: 'click', target: trigger },
      { action: 'hover', target: viewport },
      { action: 'unhover', target: viewport },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'TopCenter',
    name: 'pushes toasts at the top centre',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: trigger },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'PixelSurface',
    name: 'draws the pushed toast on the pixel surface',
    steps: [{ action: 'click', target: trigger }],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'LinearSurface',
    name: 'draws the pushed toast on the linear surface',
    steps: [{ action: 'click', target: trigger }],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'MaxLimit',
    name: 'keeps only the latest two of the toasts pushed',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: dismiss, nth: 0 },
      { action: 'click', target: trigger },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'WithAction',
    name: 'renders the action inside the toast and dismisses the toast',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: dismiss },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Loading',
    name: 'updates the loading toast into the success toast, which starts counting down',
    steps: [{ action: 'click', target: trigger }, settle],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Loading',
    name: 'holds the settled toast still while focus is inside it, expanding the stack until focus leaves',
    steps: [
      { action: 'click', target: trigger },
      { action: 'focus', target: dismiss },
      settle,
      { action: 'blur', target: dismiss },
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'Loading',
    name: 'dismisses the loading toast before it settles',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: dismiss },
      settle,
    ],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'PromiseFlow',
    name: 'shows the pending promise as a loading toast, then the success toast',
    steps: [{ action: 'click', target: trigger }, settle],
  },
  {
    component: 'PxlKitToastProvider',
    example: 'PromiseFlow',
    name: 'holds the success toast still while hovered and focused, until both leave',
    steps: [
      { action: 'click', target: trigger },
      { action: 'hover', target: viewport },
      { action: 'focus', target: dismiss },
      settle,
      { action: 'unhover', target: viewport },
      { action: 'blur', target: dismiss },
    ],
  },
  {
    component: 'PixelToast',
    example: 'WithAction',
    name: 'takes focus on its action and its dismiss button',
    steps: [
      { action: 'focus', target: action },
      { action: 'focus', target: dismiss },
      { action: 'blur', target: dismiss },
    ],
  },
  {
    component: 'PixelToast',
    example: 'Loading',
    name: 'keeps its spinner and no countdown while hovered',
    steps: [
      { action: 'hover', target: '[data-pxl-toast]' },
      { action: 'unhover', target: '[data-pxl-toast]' },
    ],
  },
];
