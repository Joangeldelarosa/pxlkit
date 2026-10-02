import type { ParityScenario } from '../interact';

const region = '[role="region"]';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelScrollArea',
    example: 'Default',
    name: 'takes keyboard focus and keeps it while scrolled with the arrow, page, Home and End keys',
    steps: [
      { action: 'focus', target: region },
      { action: 'keydown', key: 'ArrowDown' },
      { action: 'keydown', key: 'PageDown' },
      { action: 'keydown', key: 'End' },
      { action: 'keydown', key: 'Home' },
      { action: 'keydown', key: 'ArrowUp' },
      { action: 'blur', target: region },
    ],
  },
  {
    component: 'PixelScrollArea',
    example: 'AlwaysVisible',
    name: 'takes focus when pressed',
    steps: [
      { action: 'click', target: region },
      { action: 'keydown', key: 'PageUp' },
    ],
  },
  {
    component: 'PixelScrollArea',
    example: 'CustomScrollbarSize',
    name: 'leaves hover to its styles and takes focus',
    steps: [
      { action: 'hover', target: region },
      { action: 'unhover', target: region },
      { action: 'focus', target: region },
      { action: 'blur', target: region },
    ],
  },
];
