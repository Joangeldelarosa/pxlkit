import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌧️🌙 RainNight — 16×16 pixel art rainy night
 *
 * A dark cloud with rain drops under a crescent moon — nighttime rain.
 *
 * Palette:
 *   M = Moon yellow (#F0C040)
 *   C = Cloud dark  (#556677)
 *   L = Cloud edge  (#778899)
 *   B = Blue rain   (#4FC3F7)
 */
export const RainNight: PxlKitData = {
  name: 'rain-night',
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
    '....B...B.......',
    '....B...B.B.....',
    '...B...B...B....',
    '...B...B...B....',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    M: '#F0C040',
    C: '#556677',
    L: '#778899',
    B: '#4FC3F7',
  },
  tags: ['rain', 'night', 'storm', 'shower', 'weather'],
  author: 'pxlkit',
};
