import type { ParityScenario } from '../interact';

const trigger = '[data-parity-root] button';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelPopover',
    example: 'Default',
    name: 'opens from the trigger and closes on Escape',
    steps: [
      { action: 'click', target: trigger },
      { action: 'keydown', key: 'Escape' },
    ],
  },
  {
    component: 'PixelPopover',
    example: 'Default',
    name: 'toggles from the trigger and closes on a press outside',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: trigger },
      { action: 'click', target: trigger },
      { action: 'pointerdown', target: 'body' },
    ],
  },
  {
    component: 'PixelPopover',
    example: 'WithArrow',
    name: 'renders the arrow inside the open content',
    steps: [{ action: 'click', target: trigger }],
  },
  {
    component: 'PixelPopover',
    example: 'SidePlacement',
    name: 'anchors to the side and alignment it asks for',
    steps: [{ action: 'click', target: trigger }],
  },
  {
    component: 'PixelPopover',
    example: 'InteractiveContent',
    name: 'returns focus to the trigger when Escape closes focused content',
    steps: [
      { action: 'click', target: trigger },
      { action: 'focus', target: '#popover-form-name' },
      { action: 'keydown', key: 'Escape' },
    ],
  },
  {
    component: 'PixelPopover',
    example: 'InteractiveContent',
    name: 'returns focus to the trigger when an action inside closes it',
    steps: [
      { action: 'click', target: trigger },
      { action: 'click', target: '[role="dialog"] button' },
    ],
  },
  {
    component: 'PixelPopover',
    example: 'InteractiveContent',
    name: 'lets focus follow the pointer after a press outside',
    steps: [
      { action: 'click', target: trigger },
      { action: 'focus', target: '#popover-form-name' },
      { action: 'pointerdown', target: 'body' },
    ],
  },
];
