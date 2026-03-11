import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔥 Fire — 16×16 pixel art flame icon
 *
 * A flickering flame for streaks, hot items, and combos.
 *
 * Palette:
 *   R = Red (#FF0000)
 *   O = Orange (#FF8C00)
 *   Y = Yellow (#FFD700)
 *   W = White core (#FFFFFF)
 *   D = Dark red (#CC3300)
 */
export const Fire: PxlKitData = {
  name: 'fire',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......R........',
    '......RR........',
    '.....ROR........',
    '....ROOR..R.....',
    '....ROOOR.RR....',
    '...ROOOORROO....',
    '...ROOYOOOOO....',
    '..RROYYYOOOOR...',
    '..ROOYWYYOOOR...',
    '..ROOYWWYOOOR...',
    '..ROOYYWYYOOR...',
    '..ROOOYYOOOOR...',
    '...ROOOOOOORD...',
    '...DDRRRRRDD....',
    '................',
  ],
  palette: {
    'R': '#FF0000',
    'O': '#FF8C00',
    'Y': '#FFD700',
    'W': '#FFFFFF',
    'D': '#CC3300',
  },
  tags: ['fire', 'flame', 'hot', 'streak', 'combo', 'burn'],
  author: 'pxlkit',
};
