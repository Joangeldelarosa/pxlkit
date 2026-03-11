import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏅 Badge — 16×16 pixel art achievement badge
 *
 * A round badge with a star center — for achievements and certifications.
 *
 * Palette:
 *   G = Gold outer ring (#FFD700)
 *   D = Dark gold       (#B8860B)
 *   B = Blue center     (#3498DB)
 *   W = White star      (#FFFFFF)
 *   S = Star shadow     (#AED6F1)
 */
export const Badge: PxlKitData = {
  name: 'badge',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '.....GGGGG......',
    '...GGBBBBBGG....',
    '..GBBBBBBBBBG...',
    '.GBBBBWBBBBBBG..',
    '.GBBWWWWWBBBBBG.',
    '.GBBBBBBBBBBBG..',
    '.GBBBWWWWWBBBG..',
    '.GBBBBBBBBBBBG..',
    '.GBBBBWBBBBBBG..',
    '..GBBBBBBBBBG...',
    '...GGBBBBBGG....',
    '.....GDDGG......',
    '.....G..G.......',
    '.....GGGG.......',
    '................',
  ],
  palette: {
    G: '#FFD700',
    D: '#B8860B',
    B: '#3498DB',
    W: '#FFFFFF',
    S: '#AED6F1',
  },
  tags: ['badge', 'achievement', 'award', 'certified', 'medal', 'feedback'],
  author: 'pxlkit',
};
