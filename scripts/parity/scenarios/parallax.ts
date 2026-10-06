import type { ParityScenario } from '../interact';

// The layer: the first element inside the example's frame, or the example itself.
const mouseLayer = '.relative > :first-child';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelParallaxLayer',
    example: 'Default',
    name: 'places the layer by the scroll on the next animation frame and keeps it there while the page holds still',
    steps: [
      { action: 'wait', ms: 15 },
      { action: 'wait', ms: 16 },
      { action: 'wait', ms: 500 },
    ],
  },
  {
    component: 'PixelParallaxLayer',
    example: 'Foreground',
    name: 'moves the other way with a negative speed',
    steps: [{ action: 'wait', ms: 32 }],
  },
  {
    component: 'PixelParallaxLayer',
    example: 'Horizontal',
    name: 'moves along the x axis',
    steps: [{ action: 'wait', ms: 32 }],
  },
  {
    component: 'PixelMouseParallax',
    example: 'Default',
    name: 'eases towards a cursor that has not moved, on every frame, and hover alone does not move it',
    steps: [
      { action: 'wait', ms: 15 },
      { action: 'wait', ms: 16 },
      { action: 'hover', target: mouseLayer },
      { action: 'wait', ms: 200 },
      { action: 'unhover', target: mouseLayer },
      { action: 'wait', ms: 200 },
    ],
  },
  {
    component: 'PixelMouseParallax',
    example: 'Inverted',
    name: 'settles in place when inverted',
    steps: [{ action: 'wait', ms: 200 }],
  },
];
