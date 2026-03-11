import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎯 Target — 16×16 pixel art target/bullseye icon
 *
 * A target for objectives, goals, and accuracy.
 *
 * Palette:
 *   R = Red (#FF0000)
 *   W = White (#FFFFFF)
 *   D = Dark red (#CC0000)
 *   G = Gold center (#FFD700)
 */
export const Target: PxlKitData = {
  name: 'target',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.....RRRRRR.....',
    '...RRWWWWWWRR...',
    '..RRWWDDDDWWRR..',
    '..RWWDDRRDDWWR..',
    '.RDWWWRRRRWWWDR.',
    '.RDWWRDDDDRWWDR.',
    '.RDWWRDGGDRWWDR.',
    '.RDWWRDGGDRWWDR.',
    '.RDWWRDDDDRWWDR.',
    '.RDWWWRRRRWWWDR.',
    '..RWWDDRRDDWWR..',
    '..RRWWDDDDWWRR..',
    '...RRWWWWWWRR...',
    '.....RRRRRR.....',
    '................',
  ],
  palette: {
    'R': '#FF0000',
    'W': '#FFFFFF',
    'D': '#CC0000',
    'G': '#FFD700',
  },
  tags: ['target', 'bullseye', 'goal', 'objective', 'aim', 'accuracy'],
  author: 'pxlkit',
};
