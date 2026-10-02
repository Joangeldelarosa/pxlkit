import type { ParityScenario } from '../interact';

const badgeOverflow = '[aria-haspopup="dialog"]';
const chipDelete = 'button[aria-label^="Remove"]';
const radio = '[role="radio"]';
const checkbox = '[role="checkbox"]';
const disclosure = 'button[aria-controls]';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelAvatar',
    example: 'WithImage',
    name: 'falls back to the initials when the image fails to load, and stays there',
    steps: [
      { action: 'error', target: 'img' },
      { action: 'wait', ms: 20 },
    ],
  },
  {
    component: 'PixelBadgeGroup',
    example: 'Overflow',
    name: 'points "+N" at the open popover (aria-controls), which it names, and unwires it on close',
    steps: [
      { action: 'click', target: badgeOverflow },
      { action: 'click', target: badgeOverflow },
    ],
  },
  {
    component: 'PixelBadgeGroup',
    example: 'Overflow',
    name: 'opens the hidden badges from "+N" and closes on Escape, returning focus',
    steps: [
      { action: 'click', target: badgeOverflow },
      { action: 'keydown', key: 'Escape' },
    ],
  },
  {
    component: 'PixelBadgeGroup',
    example: 'Overflow',
    name: 'toggles the hidden badges from "+N" and closes on a press outside',
    steps: [
      { action: 'click', target: badgeOverflow },
      { action: 'click', target: badgeOverflow },
      { action: 'click', target: badgeOverflow },
      { action: 'pointerdown', target: 'body' },
    ],
  },
  {
    component: 'PixelChip',
    example: 'Clickable',
    name: 'takes focus when clicked',
    steps: [{ action: 'click', target: 'button' }],
  },
  {
    component: 'PixelChip',
    example: 'Deletable',
    name: 'reaches the delete button by focus and removes the chip from it',
    steps: [
      { action: 'focus', target: chipDelete },
      { action: 'click', target: chipDelete },
    ],
  },
  {
    component: 'PixelChip',
    example: 'ClickableAndDeletable',
    name: 'is clicked as a whole, and deleted from its own delete button',
    steps: [
      { action: 'click', target: 'button' },
      { action: 'focus', target: chipDelete },
      { action: 'click', target: chipDelete },
    ],
  },
  {
    component: 'PixelChipGroup',
    example: 'Default',
    name: 'selects one chip at a time on click, and clears it on a second click',
    steps: [
      { action: 'click', target: radio, nth: 1 },
      { action: 'click', target: radio, nth: 2 },
      { action: 'click', target: radio, nth: 2 },
    ],
  },
  {
    component: 'PixelChipGroup',
    example: 'Default',
    name: 'moves focus and selection with arrows, Home and End, stopping at the ends',
    steps: [
      { action: 'focus', target: radio },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: 'Home' },
      { action: 'keydown', key: 'ArrowLeft' },
      { action: 'keydown', key: 'End' },
      { action: 'keydown', key: 'ArrowUp' },
    ],
  },
  {
    component: 'PixelChipGroup',
    example: 'Default',
    name: 'toggles the focused chip with Space and Enter, and selects again with a move from an empty selection',
    steps: [
      { action: 'focus', target: radio },
      { action: 'keydown', key: ' ' },
      { action: 'keydown', key: 'ArrowLeft' },
      { action: 'keydown', key: 'Enter' },
      { action: 'keydown', key: 'End' },
    ],
  },
  {
    component: 'PixelChipGroup',
    example: 'MultiSelect',
    name: 'toggles chips in and out of the selection by click, Space and Enter; arrows do not move',
    steps: [
      { action: 'click', target: checkbox, nth: 2 },
      { action: 'click', target: checkbox },
      { action: 'keydown', key: ' ' },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'focus', target: checkbox, nth: 3 },
      { action: 'keydown', key: 'Enter' },
      { action: 'keydown', key: 'Home' },
    ],
  },
  {
    component: 'PixelChipGroup',
    example: 'Surfaces',
    name: 'keeps each group its own selection',
    steps: [
      { action: 'click', target: radio, nth: 1 },
      { action: 'click', target: radio, nth: 2 },
      { action: 'keydown', key: 'ArrowRight' },
    ],
  },
  {
    component: 'PixelTextLink',
    example: 'Tones',
    name: 'takes keyboard focus on each link',
    steps: [
      { action: 'focus', target: 'a' },
      { action: 'focus', target: 'a', nth: 3 },
      { action: 'focus', target: 'a', nth: 6 },
      { action: 'blur', target: 'a', nth: 6 },
    ],
  },
  {
    component: 'PixelTextLink',
    example: 'AsButton',
    name: 'is a focusable button without an href',
    steps: [
      { action: 'focus', target: 'button' },
      { action: 'click', target: 'button' },
    ],
  },
  {
    component: 'PixelTextLink',
    example: 'InlineInProse',
    name: 'takes focus inside prose',
    steps: [{ action: 'focus', target: 'a' }],
  },
  {
    component: 'PixelCollapsible',
    example: 'Default',
    name: 'opens and closes the body from the header, wiring aria-expanded and aria-controls',
    steps: [
      { action: 'click', target: disclosure },
      { action: 'click', target: disclosure },
    ],
  },
  {
    component: 'PixelCollapsible',
    example: 'DefaultOpen',
    name: 'starts open and collapses from the header',
    steps: [
      { action: 'click', target: disclosure },
      { action: 'click', target: disclosure },
    ],
  },
  {
    component: 'PixelCollapsible',
    example: 'Tones',
    name: 'toggles each collapsible on its own',
    steps: [
      { action: 'click', target: disclosure, nth: 1 },
      { action: 'click', target: disclosure, nth: 6 },
      { action: 'click', target: disclosure, nth: 1 },
    ],
  },
  {
    component: 'PixelCollapsible',
    example: 'RichContent',
    name: 'hides and shows its list',
    steps: [
      { action: 'focus', target: disclosure },
      { action: 'click', target: disclosure },
      { action: 'click', target: disclosure },
    ],
  },
];
