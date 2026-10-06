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
  {
    component: 'PixelHeroSection',
    example: 'TypewriterHeadline',
    name: 'types its headline out behind the caret, which screen readers get whole',
    // "Loadi" after 300 ms; the 24 characters after 1440 ms.
    steps: [
      { action: 'wait', ms: 330 },
      { action: 'wait', ms: 1140 },
    ],
  },
  {
    component: 'PixelHeroSection',
    example: 'TypewriterHeadline',
    name: 'shows its whole headline at once for a reader who prefers reduced motion',
    reducedMotion: true,
    steps: [{ action: 'wait', ms: 330 }],
  },
  {
    component: 'PixelHeroSection',
    example: 'GlitchHeadline',
    name: 'shows its headline alone and still for a reader who prefers reduced motion',
    reducedMotion: true,
    steps: [{ action: 'wait', ms: 3000 }],
  },
];
