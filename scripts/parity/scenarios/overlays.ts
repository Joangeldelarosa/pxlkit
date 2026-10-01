import type { ParityScenario } from '../interact';

const opener = '[data-parity-root] button';
const closeButton = '[role="dialog"] button[aria-label]';
const backdrop = '[data-pxl-overlay-backdrop]';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelModal',
    example: 'Default',
    name: 'opens with focus inside, keeps Tab inside and closes on Escape, returning focus',
    steps: [
      { action: 'click', target: opener },
      { action: 'keydown', key: 'Tab' },
      { action: 'keydown', key: 'Tab', shiftKey: true },
      { action: 'keydown', key: 'Escape' },
    ],
  },
  {
    component: 'PixelModal',
    example: 'Default',
    name: 'closes from the close button and from the backdrop',
    steps: [
      { action: 'click', target: opener },
      { action: 'click', target: closeButton },
      { action: 'click', target: opener },
      { action: 'click', target: backdrop },
    ],
  },
  {
    component: 'PixelModal',
    example: 'WithFooter',
    name: 'cycles focus through the footer actions and closes from one',
    steps: [
      { action: 'click', target: opener },
      { action: 'keydown', key: 'Tab', shiftKey: true },
      { action: 'keydown', key: 'Tab' },
      { action: 'keydown', key: 'Tab', shiftKey: true },
      { action: 'click', target: '[role="dialog"] button', nth: 2 },
    ],
  },
  {
    component: 'PixelModal',
    example: 'AsyncClose',
    name: 'shows a busy close button until asyncClose settles',
    steps: [
      { action: 'click', target: opener },
      { action: 'click', target: closeButton },
      { action: 'keydown', key: 'Escape' },
      { action: 'wait', ms: 900 },
    ],
  },
  {
    component: 'PixelModal',
    example: 'Sizes',
    name: 'renders each size',
    steps: [
      { action: 'click', target: opener, nth: 2 },
      { action: 'keydown', key: 'Escape' },
      { action: 'click', target: opener, nth: 4 },
    ],
  },
  {
    component: 'PixelModal',
    example: 'Surfaces',
    name: 'renders the linear card and the pixel window',
    steps: [
      { action: 'click', target: opener, nth: 1 },
      { action: 'click', target: closeButton },
      { action: 'click', target: opener },
    ],
  },
  {
    component: 'PixelModal',
    example: 'WithDescription',
    name: 'describes the dialog with its description',
    steps: [{ action: 'click', target: opener }],
  },
  {
    component: 'PixelModal',
    example: 'CustomCloseLabel',
    name: 'labels the close button as asked',
    steps: [{ action: 'click', target: opener }],
  },
];
