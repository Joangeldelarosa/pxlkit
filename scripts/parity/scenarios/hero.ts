import type { ParityScenario } from '../interact';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelHeroSection',
    example: 'Default',
    name: 'reaches and clicks its calls to action',
    steps: [
      { action: 'focus', target: 'h1 ~ div button' },
      { action: 'focus', target: 'h1 ~ div button', nth: 1 },
      { action: 'click', target: 'h1 ~ div button' },
    ],
  },
  {
    component: 'PixelHeroSection',
    example: 'Split',
    name: 'reaches its call to action beside the media column',
    steps: [
      { action: 'focus', target: 'h1 ~ div button' },
      { action: 'blur', target: 'h1 ~ div button' },
    ],
  },
];
