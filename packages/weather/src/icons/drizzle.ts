import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌦️ Drizzle — 16×16 pixel art light rain icon
 *
 * A small cloud with sparse raindrops for light rain and drizzle conditions.
 *
 * Palette:
 *   C = Cloud gray   (#AAB7C4)
 *   D = Cloud shadow (#6E7C8A)
 *   B = Rain blue    (#4AA3FF)
 */
export const Drizzle: PxlKitData = {
  name: 'drizzle',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '................',
    '......CCC.......',
    '....CCCCCCC.....',
    '...CCCCCCCCC....',
    '..CCCCCCCCCCC...',
    '..CCCCCCCCCCC...',
    '...DDDDDDDDD....',
    '.....B..B.......',
    '......B..B......',
    '.....B..........',
    '...........B....',
    '..........B.....',
    '................',
    '................',
    '................',
  ],
  palette: {
    C: '#AAB7C4',
    D: '#6E7C8A',
    B: '#4AA3FF',
  },
  tags: ['drizzle', 'rain', 'light-rain', 'weather', 'cloud'],
  author: 'pxlkit',
};
