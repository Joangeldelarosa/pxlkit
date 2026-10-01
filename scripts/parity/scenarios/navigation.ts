import type { ParityScenario } from '../interact';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelTabs',
    example: 'Default',
    name: 'selects on click and moves focus with arrows, Home and End (automatic activation)',
    steps: [
      { action: 'click', target: '[role="tab"]', nth: 1 },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: 'Home' },
      { action: 'keydown', key: 'End' },
      { action: 'keydown', key: 'ArrowLeft' },
    ],
  },
  {
    component: 'PixelTabs',
    example: 'Vertical',
    name: 'navigates with up and down arrows when vertical',
    steps: [
      { action: 'focus', target: '[role="tab"]' },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'keydown', key: 'ArrowUp' },
    ],
  },
  {
    component: 'PixelTabs',
    example: 'ManualActivation',
    name: 'moves focus without selecting until Enter or Space (manual activation)',
    steps: [
      { action: 'focus', target: '[role="tab"]' },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: 'Enter' },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: ' ' },
    ],
  },
  {
    component: 'PixelTabs',
    example: 'Controlled',
    name: 'reports the active tab to its controller',
    steps: [{ action: 'click', target: '[role="tab"]', nth: 2 }],
  },
  {
    component: 'PixelTabs',
    example: 'KeepMounted',
    name: 'keeps every panel mounted, hiding the inactive ones',
    steps: [{ action: 'click', target: '[role="tab"]', nth: 1 }],
  },
  {
    component: 'PixelTabs',
    example: 'Compositional',
    name: 'composed tabs select and navigate like the shorthand',
    steps: [
      { action: 'click', target: '[role="tab"]', nth: 2 },
      { action: 'keydown', key: 'ArrowRight' },
    ],
  },
];
