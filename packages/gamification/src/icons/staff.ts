import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔮 Staff — a wizard staff: a glowing crystal orb on top of a long, thin
 * wooden shaft. The old one had a wide pedestal base that read as a chalice.
 *
 *   C = Crystal blue (#4FC3F7)
 *   W = White shine (#FFFFFF)
 *   B = Brown wood (#6B4226)
 *   D = Dark wood (#3E2010)
 */
export const Staff: PxlKitData = {
  name: 'staff',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......CCCC......',
    '.....CCCCCC.....',
    '.....CWWCCC.....',
    '.....CCCCCC.....',
    '......CCCC......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '......DDDD......',
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
