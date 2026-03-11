import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * ↓ BouncingArrow — 16×16 animated bouncing down arrow
 *
 * A chevron arrow that bounces downward — scroll down, continue, more below.
 * 3 frames — up / center / down, 280ms per frame.
 *
 * Palette:
 *   B = Blue arrow (#5B9BD5)  D = Dark shadow (#2E6DA4)
 */
export const BouncingArrow: AnimatedPxlKitData = {
  name: 'bouncing-arrow',
  size: 16,
  category: 'ui',
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
  },
  frames: [
    {
      grid: [
        '................',
        '................',
        '.B............B.',
        '.BB..........BB.',
        '.BBB........BBB.',
        '..BBB......BBB..',
        '...BBB....BBB...',
        '....BBB..BBB....',
        '.....BBBBBB.....',
        '......BBBB......',
        '.......BB.......',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '................',
        '.B............B.',
        '.BB..........BB.',
        '.BBB........BBB.',
        '..BBB......BBB..',
        '...BBB....BBB...',
        '....BBB..BBB....',
        '.....BBBBBB.....',
        '......BBBB......',
        '.......BB.......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '................',
        '................',
        '.B............B.',
        '.BB..........BB.',
        '.BBB........BBB.',
        '..BBB......BBB..',
        '...BBB....BBB...',
        '....BBB..BBB....',
        '.....BBBBBB.....',
        '......BBBB......',
        '.......BB.......',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 280,
  loop: true,
  trigger: 'loop',
  tags: ['arrow', 'down', 'scroll', 'bounce', 'chevron', 'animated', 'ui'],
  author: 'pxlkit',
};
