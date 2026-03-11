import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔮 Staff — 16×16 pixel art wizard staff
 *
 * A tall wooden staff with a glowing crystal orb at the top.
 *
 * Palette:
 *   C = Crystal blue (#4FC3F7)
 *   W = White shine  (#FFFFFF)
 *   B = Brown wood   (#6B4226)
 *   D = Dark wood    (#3E2010)
 */
export const Staff: PxlKitData = {
  name: 'staff',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.....CCCCC......',
    '....CCWCCCC.....',
    '....CCWCCCC.....',
    '.....CCCCC......',
    '......BBB.......',
    '......BBB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '......BBB.......',
    '.....BBBBB......',
    '....BBBBBBB.....',
    '.....DDDDD......',
    '................',
  ],
  palette: {
    C: '#4FC3F7',
    W: '#FFFFFF',
    B: '#6B4226',
    D: '#3E2010',
  },
  tags: ['staff', 'wizard', 'magic', 'orb', 'mage', 'rpg'],
  author: 'pxlkit',
};
