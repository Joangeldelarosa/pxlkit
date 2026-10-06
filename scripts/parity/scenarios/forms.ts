import type { ParityScenario } from '../interact';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelSwitch',
    example: 'Default',
    name: 'toggles on click and keeps focus on the switch',
    steps: [
      { action: 'click', target: '[role="switch"]' },
      { action: 'click', target: '[role="switch"]' },
    ],
  },
  {
    component: 'PixelSwitch',
    example: 'WithFormName',
    name: 'submits its value only while on',
    steps: [{ action: 'click', target: '[role="switch"]' }, { action: 'click', target: '[role="switch"]' }],
  },
  {
    component: 'PixelSwitch',
    example: 'Disabled',
    name: 'ignores clicks while disabled',
    steps: [{ action: 'click', target: '[role="switch"]', nth: 1 }],
  },
];
