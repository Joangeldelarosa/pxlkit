import type { PxlKitData } from '@pxlkit/core';

/**
 * ✏️ Pencil — 16×16 pixel art pencil icon
 *
 * A drawing pencil for editor/builder tools.
 */
export const Pencil: PxlKitData = {
  name: 'pencil',
  size: 16,
  category: 'ui',
  grid: [
    '..............GG',
    '.............GYG',
    '............GYYG',
    '...........GYYG.',
    '..........GYYG..',
    '.........GYYG...',
    '........GYYG....',
    '.......GBYG.....',
    '......GBYG......',
    '.....GBYG.......',
    '....GBYG........',
    '...GBYG.........',
    '..GBGG..........',
    '.GBDG...........',
    '.GDG............',
    '..G.............',
  ],
  palette: {
    G: '#4A4A4A',
    Y: '#FFD700',
    B: '#D4A017',
    D: '#8B4513',
  },
  tags: ['pencil', 'draw', 'edit', 'tool', 'write'],
};
