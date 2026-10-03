import type { ParityScenario } from '../interact';

const buttonCard = '[role="button"]';
const starButton = 'button[data-pxl-star]';

export const scenarios: ParityScenario[] = [
  {
    component: 'PixelCard',
    example: 'Interactive',
    name: 'takes focus as a button, and is activated by click, Enter and Space',
    steps: [
      { action: 'focus', target: buttonCard },
      { action: 'keydown', key: 'Enter' },
      { action: 'keydown', key: ' ' },
      { action: 'click', target: buttonCard },
      { action: 'blur', target: buttonCard },
    ],
  },
  {
    component: 'PixelCard',
    example: 'AsLink',
    name: 'is a link that takes focus',
    steps: [
      { action: 'focus', target: 'a' },
      { action: 'keydown', key: 'Enter' },
    ],
  },
  {
    component: 'PixelFeatureCard',
    example: 'Interactive',
    name: 'takes focus as a button, and is activated by click, Enter and Space',
    steps: [
      { action: 'focus', target: buttonCard },
      { action: 'keydown', key: 'Enter' },
      { action: 'keydown', key: ' ' },
      { action: 'click', target: buttonCard },
      { action: 'blur', target: buttonCard },
    ],
  },
  {
    component: 'PixelFeatureCard',
    example: 'AsLink',
    name: 'is a link that takes focus',
    steps: [
      { action: 'focus', target: 'a' },
      { action: 'keydown', key: 'Enter' },
    ],
  },
  {
    component: 'PixelStarRating',
    example: 'Interactive',
    name: 'rates with a click on a star, up and down, the clicked star keeping focus',
    steps: [
      { action: 'click', target: starButton, nth: 4 },
      { action: 'click', target: starButton },
      { action: 'click', target: starButton, nth: 2 },
      { action: 'click', target: starButton, nth: 2 },
    ],
  },
  {
    component: 'PixelStarRating',
    example: 'Interactive',
    name: 'takes focus on each star button, which keys other than Enter and Space leave alone',
    steps: [
      { action: 'focus', target: starButton },
      { action: 'keydown', key: 'ArrowRight' },
      { action: 'keydown', key: 'End' },
      { action: 'focus', target: starButton, nth: 3 },
      { action: 'keydown', key: 'Home' },
      { action: 'blur', target: starButton, nth: 3 },
    ],
  },
];
