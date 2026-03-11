import type { PxlKitData } from '@pxlkit/core';

/**
 * 🛡️ Shield — 16×16 pixel art shield icon
 *
 * A sturdy metal shield with a cross emblem.
 *
 * Palette:
 *   B = Blue (#4169E1)
 *   L = Light blue (#6495ED)
 *   D = Dark blue (#1E3A6E)
 *   G = Gold trim (#FFD700)
 *   W = White cross (#FFFFFF)
 */
export const Shield: PxlKitData = {
  name: 'shield',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '...GGGGGGGGGG...',
    '..GBBBBBBBBBBG..',
    '..GBBLBBBBLLBG..',
    '..GBBBWWWWBBBG..',
    '..GBBBWWWWBBBG..',
    '..GBBBBWWBBBBG..',
    '..GBBBBWWBBBBG..',
    '..GBBBBWWBBBBG..',
    '...GBBBBBBBBG...',
    '...GDBBBBBDGG...',
    '....GDBBBBDG....',
    '....GGDBBDGG....',
    '.....GGDDGG.....',
    '......GGGG......',
    '................',
  ],
  palette: {
    'B': '#4169E1',
    'L': '#6495ED',
    'D': '#1E3A6E',
    'G': '#FFD700',
    'W': '#FFFFFF',
  },
  tags: ['shield', 'defense', 'protect', 'armor', 'guard', 'rpg'],
  author: 'pxlkit',
};
