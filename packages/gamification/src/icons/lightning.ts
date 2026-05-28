import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚡ Lightning — a clean zigzag bolt: top segment slants down-left to a wide
 * flash, jogs, then the bottom segment continues down-left to a point. The old
 * one had a blobby diamond head that read as a fat "S".
 *
 *   Y = Yellow (#FFD700)
 *   W = White hot edge (#FFFFFF)
 *   D = Dark yellow (#B8860B)
 */
export const Lightning: PxlKitData = {
  name: 'lightning',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.........WYY....',
    '........WYY.....',
    '.......WYY......',
    '......WYYY......',
    '.....WYYYYY.....',
    '....WYYYYYD.....',
    '........YYD.....',
    '.......YYD......',
    '......YYD.......',
    '.....YYD........',
    '....YYD.........',
    '...YYD..........',
    '...YD...........',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    W: '#FFFFFF',
    D: '#B8860B',
  },
  tags: ['lightning', 'bolt', 'power', 'energy', 'speed', 'electric'],
  author: 'pxlkit',
};
