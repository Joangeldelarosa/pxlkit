import type { PxlKitData } from '@pxlkit/core';

/**
 * → ArrowRight — 16×16 pixel art right arrow icon
 */
export const ArrowRight: PxlKitData = {
  name: 'arrow-right',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '................',
    '.........GG.....',
    '..........GG....',
    '...........GG...',
    '.GGGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGG..',
    '...........GG...',
    '..........GG....',
    '.........GG.....',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#AAAAAA',
  },
  tags: ['arrow', 'right', 'forward', 'next', 'direction'],
};
