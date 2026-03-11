import type { PxlKitData } from '@pxlkit/core';

/**
 * 💉 Eyedropper — 16×16 pixel art eyedropper/color picker icon
 *
 * An eyedropper tool for sampling colors.
 */
export const Eyedropper: PxlKitData = {
  name: 'eyedropper',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '...........GGG..',
    '..........GWWG..',
    '..........GWWG..',
    '.........GGGWG..',
    '........GCCGG...',
    '.......GCCG.....',
    '......GCCG......',
    '.....GCCG.......',
    '....GCCG........',
    '...GCCG.........',
    '..GCCG..........',
    '..GDGG..........',
    '..GDG...........',
    '...G............',
    '................',
  ],
  palette: {
    G: '#555555',
    C: '#4ECDC4',
    W: '#FFFFFF',
    D: '#333333',
  },
  tags: ['eyedropper', 'color-picker', 'sample', 'tool', 'pipette'],
};
