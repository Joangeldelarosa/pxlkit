import type { PxlKitData } from '@pxlkit/core';

/**
 * ❄️🌙 SnowNight — 16×16 pixel art snowy night
 *
 * A dark cloud with snowflake dots under a crescent moon.
 *
 * Palette:
 *   M = Moon yellow (#F0C040)
 *   C = Cloud dark  (#556677)
 *   L = Cloud edge  (#778899)
 *   W = Snow white  (#DDEEFF)
 */
export const SnowNight: PxlKitData = {
  name: 'snow-night',
  size: 16,
  category: 'weather',
  grid: [
    '..............MM',
    '............MMMM',
    '...LLC.CC...MMM.',
    '..LCCCCCCC.MMMM.',
    '.LCCCCCCCCCC....',
    '.LCCCCCCCCCC....',
    '..CCCCCCCCCC....',
    '...CCCCCCCC.....',
    '....W...W.......',
    '...W.W.W.W......',
    '....W...W.W.....',
    '...W.W.W.W......',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    M: '#F0C040',
    C: '#556677',
    L: '#778899',
    W: '#DDEEFF',
  },
  tags: ['snow', 'night', 'winter', 'cold', 'weather'],
  author: 'pxlkit',
};
