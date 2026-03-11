import type { PxlKitData } from '@pxlkit/core';

/**
 * 🚩 Flag — 16×16 pixel art flag icon
 *
 * A checkpoint/milestone flag for progress tracking.
 *
 * Palette:
 *   R = Red (#FF0000)
 *   D = Dark red (#CC0000)
 *   B = Brown pole (#8B4513)
 *   K = Dark brown (#5C2D06)
 */
export const Flag: PxlKitData = {
  name: 'flag',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..B.............',
    '..BRRRRRRR......',
    '..BRDRRRRRD.....',
    '..BRRRRRRRD.....',
    '..BRRRRDRRRD....',
    '..BRRRRRRRD.....',
    '..BRRRRRRD......',
    '..BDDDDDD.......',
    '..B.............',
    '..B.............',
    '..B.............',
    '..B.............',
    '.KBK............',
    '.KKK............',
    '................',
  ],
  palette: {
    'R': '#FF0000',
    'D': '#CC0000',
    'B': '#8B4513',
    'K': '#5C2D06',
  },
  tags: ['flag', 'checkpoint', 'milestone', 'goal', 'finish', 'marker'],
  author: 'pxlkit',
};
