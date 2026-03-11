import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚡ Lightning — 16×16 pixel art lightning bolt icon
 *
 * A bright electric bolt for power-ups and speed boosts.
 *
 * Palette:
 *   Y = Yellow (#FFD700)
 *   L = Light yellow (#FFF44F)
 *   W = White (#FFFFFF)
 *   D = Dark yellow (#B8860B)
 */
export const Lightning: PxlKitData = {
  name: 'lightning',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......WW........',
    '.....WYYW.......',
    '....WYYYYW......',
    '...WYYYYD.......',
    '....YYYD........',
    '....YYD.........',
    '...YYD..........',
    '..YYYYYYYY......',
    '.....WYYYYYY....',
    '.......YYYYD....',
    '......YYYD......',
    '.....YYYD.......',
    '....YYYD........',
    '....YYD.........',
    '.....D..........',
  ],
  palette: {
    'Y': '#FFD700',
    'W': '#FFFFFF',
    'D': '#B8860B',
  },
  tags: ['lightning', 'bolt', 'power', 'energy', 'speed', 'electric'],
  author: 'pxlkit',
};
