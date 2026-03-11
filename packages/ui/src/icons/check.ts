import type { PxlKitData } from '@pxlkit/core';

/**
 * ✓ Check — 16×16 pixel art checkmark icon
 *
 * A simple checkmark for confirmation/success.
 */
export const Check: PxlKitData = {
  name: 'check',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '.............GGG',
    '............GGG.',
    '...........GGG..',
    '..........GGG...',
    '.........GGG....',
    '........GGG.....',
    '.GGG...GGG......',
    '..GGG.GGG.......',
    '...GGGGG........',
    '....GGG.........',
    '.....G..........',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#00FF88',
  },
  tags: ['check', 'checkmark', 'confirm', 'done', 'valid', 'tick'],
};
