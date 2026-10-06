import type { ParityScenario } from '../interact';

const chevron = '[aria-haspopup="menu"]';
const option = '[role="menuitem"]';
// The primary half of a split button: the first button of its frame.
const primary = '.overflow-hidden > button:first-child';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelBareButton',
    example: 'WithOnClick',
    name: 'counts its clicks',
    steps: [
      { action: 'click', target: 'button' },
      { action: 'click', target: 'button' },
    ],
  },
  {
    component: 'PixelBareButton',
    example: 'Disabled',
    name: 'takes neither clicks nor focus while disabled',
    steps: [
      { action: 'click', target: 'button' },
      { action: 'focus', target: 'button' },
    ],
  },
  {
    component: 'PixelBareButton',
    example: 'SubmitType',
    name: 'submits and resets its form, which stays on the page',
    steps: [
      { action: 'click', target: 'button[type="submit"]' },
      { action: 'click', target: 'button[type="reset"]' },
    ],
  },
  {
    component: 'PixelBareButton',
    example: 'AsIconTrigger',
    name: 'takes and loses focus as an icon trigger',
    steps: [
      { action: 'focus', target: 'button' },
      { action: 'blur', target: 'button' },
    ],
  },
  {
    component: 'PxlKitButton',
    example: 'Tones',
    name: 'takes focus and clicks',
    steps: [
      { action: 'focus', target: 'button', nth: 2 },
      { action: 'click', target: 'button', nth: 5 },
    ],
  },
  {
    component: 'PxlKitButton',
    example: 'Disabled',
    name: 'takes neither clicks nor focus while disabled',
    steps: [
      { action: 'click', target: 'button' },
      { action: 'focus', target: 'button' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Default',
    name: 'opens from the chevron with focus in the menu, whose active descendant follows the arrows, Home and End, then chooses with Enter, focusing the chevron again',
    steps: [
      { action: 'click', target: chevron },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: 'Home' },
      { action: 'keydown', key: 'End' },
      { action: 'keydown', key: 'Enter' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Default',
    name: 'opens on its first option from ArrowDown and on its last from ArrowUp on the chevron, closes on Escape and chooses with Space, focusing the chevron again each time',
    steps: [
      { action: 'focus', target: chevron },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'Escape' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: ' ' },
      { action: 'click', target: chevron },
      { action: 'click', target: chevron },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Default',
    name: 'chooses nothing on Enter while nothing is highlighted',
    steps: [
      { action: 'click', target: chevron },
      { action: 'keydown', key: 'Enter' },
      { action: 'keydown', key: ' ' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Default',
    name: 'closes on Tab and Shift+Tab with focus back on the chevron',
    steps: [
      { action: 'click', target: chevron },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'Tab' },
      { action: 'click', target: chevron },
      { action: 'keydown', key: 'Tab', shiftKey: true },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Default',
    name: 'moves into the open menu from the chevron with an arrow key',
    steps: [
      { action: 'click', target: chevron },
      { action: 'focus', target: chevron },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'focus', target: chevron },
      { action: 'keydown', key: 'ArrowUp' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Default',
    name: 'jumps to an option by typing its label, starting over after a pause',
    steps: [
      { action: 'click', target: chevron },
      { action: 'keydown', key: 'e' },
      { action: 'keydown', key: 'x' },
      { action: 'wait', ms: 1200 },
      { action: 'keydown', key: 'i' },
      { action: 'wait', ms: 1200 },
      { action: 'keydown', key: 's' },
      { action: 'keydown', key: 'v' },
      { action: 'keydown', key: 'Enter' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'WithCallbacks',
    name: 'runs the primary action, highlights an option on hover, chooses one on click focusing the chevron again, and closes on a press outside, focus following the pointer',
    steps: [
      { action: 'click', target: primary },
      { action: 'click', target: chevron },
      { action: 'hover', target: option, nth: 2 },
      { action: 'click', target: option, nth: 1 },
      { action: 'click', target: chevron },
      { action: 'pointerdown', target: 'body' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'WithCallbacks',
    name: 'chooses an option from the keyboard and keeps the menu open while the primary action runs',
    steps: [
      { action: 'focus', target: chevron },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'Enter' },
      { action: 'click', target: chevron },
      { action: 'click', target: primary },
      { action: 'keydown', key: 'Escape' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Tones',
    name: 'opens one menu at a time, closing the other on the press outside it',
    steps: [
      { action: 'click', target: chevron, nth: 3 },
      { action: 'click', target: chevron, nth: 1 },
      { action: 'keydown', key: 'End' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Surfaces',
    name: 'draws the menu for each surface',
    steps: [
      { action: 'click', target: chevron },
      { action: 'click', target: chevron, nth: 1 },
      { action: 'keydown', key: 'ArrowDown' },
    ],
  },
  {
    component: 'PixelSplitButton',
    example: 'Disabled',
    name: 'neither runs nor opens while disabled',
    steps: [
      { action: 'click', target: primary },
      { action: 'click', target: chevron },
      { action: 'focus', target: chevron },
    ],
  },
];
