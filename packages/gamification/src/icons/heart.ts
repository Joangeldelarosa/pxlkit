import type { PxlKitData } from '@pxlkit/core';

/**
 * ❤️ Heart — 16×16 pixel art heart icon
 *
 * A classic health/life heart for games.
 *
 * Palette:
 *   R = Red (#FF0000)
 *   L = Light red (#FF6B6B)
 *   D = Dark red (#CC0000)
 *   W = White shine (#FFFFFF)
 */
export const Heart: PxlKitData = {
  name: 'heart',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..DDDD....DDDD..',
    '.DRRRRD..DRRRRD.',
    '.DWLRRD..DRRRRD.',
    '.DWRRRRDDDRRRRD.',
    '.DRRRRRRRRRRRRD.',
    '.DRRRRRRRRRRRRD.',
    '..DRRRRRRRRRRD..',
    '...DRRRRRRRRD...',
    '....DRRRRRRD....',
    '.....DRRRRD.....',
    '......DRRD......',
    '.......DD.......',
    '................',
    '................',
    '................',
  ],
  palette: {
    'R': '#FF0000',
    'L': '#FF6B6B',
    'D': '#CC0000',
    'W': '#FFFFFF',
  },
  tags: ['heart', 'health', 'life', 'love', 'hp', 'vitality'],
  author: 'pxlkit',
};
