import type { ParityScenario, ParityStep } from '../interact';

// The animated wrapper: the example's first element — a <div> or <span> in
// React and Vue, the component's host in Angular.
const wrapper = '[data-parity-root] > *';

const hoverExamples = [
  { component: 'PixelBounce', example: 'HoverTrigger' },
  { component: 'PixelFadeIn', example: 'OnHover' },
  { component: 'PixelFlicker', example: 'HoverTrigger' },
  { component: 'PixelFloat', example: 'HoverTrigger' },
  { component: 'PixelGlitch', example: 'HoverTrigger' },
  { component: 'PixelPulse', example: 'HoverTrigger' },
  { component: 'PixelRotate', example: 'HoverTrigger' },
  { component: 'PixelShake', example: 'OnHover' },
  { component: 'PixelSlideIn', example: 'OnHover' },
  { component: 'PixelZoomIn', example: 'HoverTrigger' },
];

const hoverSteps: ParityStep[] = [
  { action: 'hover', target: wrapper },
  { action: 'unhover', target: wrapper },
  { action: 'hover', target: wrapper },
];

// The typewriter types one character every `speed` ms (60 by default) on
// the harness's simulated clock; the waits stop between two characters.
export const scenarios: ParityScenario[] = [
  ...hoverExamples.map(({ component, example }) => ({
    component,
    example,
    name: 'plays while hovered, stops once the pointer leaves, and plays again',
    steps: hoverSteps,
  })),
  ...hoverExamples.map(({ component, example }) => ({
    component,
    example,
    name: 'holds still while hovered, for a reader who prefers reduced motion',
    reducedMotion: true,
    steps: hoverSteps,
  })),
  {
    component: 'PixelZoomIn',
    example: 'HoverTrigger',
    name: 'is not started by focusing or clicking the button inside, only by the pointer',
    steps: [
      { action: 'focus', target: `${wrapper} button` },
      { action: 'click', target: `${wrapper} button` },
      { action: 'hover', target: wrapper },
      { action: 'blur', target: `${wrapper} button` },
    ],
  },
  {
    component: 'PixelTypewriter',
    example: 'Default',
    name: 'types one character at a time behind the caret, then drops the caret',
    // "Hello" after 300 ms; the 14 characters after 840 ms.
    steps: [
      { action: 'wait', ms: 330 },
      { action: 'wait', ms: 540 },
    ],
  },
  {
    component: 'PixelTypewriter',
    example: 'Default',
    name: 'shows the whole text at once, without a caret, for a reader who prefers reduced motion',
    reducedMotion: true,
    steps: [{ action: 'wait', ms: 330 }],
  },
  {
    component: 'PixelTypewriter',
    example: 'FastCyan',
    name: 'types at its faster pace',
    // "Typing fast" after 330 ms; the 22 characters after 660 ms.
    steps: [
      { action: 'wait', ms: 345 },
      { action: 'wait', ms: 330 },
    ],
  },
  {
    component: 'PixelTypewriter',
    example: 'NoCursor',
    name: 'types without a caret',
    // "No bl" after 300 ms; the 23 characters after 1380 ms.
    steps: [
      { action: 'wait', ms: 330 },
      { action: 'wait', ms: 1080 },
    ],
  },
  {
    component: 'PixelTypewriter',
    example: 'OnView',
    name: 'types once in view — at once where IntersectionObserver is missing',
    // "Types" after 300 ms; the 30 characters after 1800 ms.
    steps: [
      { action: 'wait', ms: 330 },
      { action: 'wait', ms: 1500 },
    ],
  },
];
