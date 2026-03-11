import type { PxlKitData } from '@pxlkit/core';

/**
 * 🪣 PaintBucket — 16×16 pixel art paint bucket icon
 *
 * A tilted bucket pouring paint, for the fill tool.
 */
export const PaintBucket: PxlKitData = {
  name: 'paint-bucket',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '..GG............',
    '.GBBG...........',
    '.GBBBG..........',
    '.GBBBBGGGGGG....',
    '..GBBBBBBBBGG...',
    '..GBBBBBBBBBBG..',
    '...GBBBBBBBBG...',
    '...GBBBBBBBBG...',
    '....GBBBBBBG....',
    '....GBBBBBBG....',
    '.....GBBBBG.....',
    '.....GBBBBG.....',
    '......GBBG......',
    '.......GG.......',
    '................',
  ],
  palette: {
    G: '#555555',
    B: '#4ECDC4',
  },
  tags: ['bucket', 'fill', 'paint', 'tool', 'pour'],
};
