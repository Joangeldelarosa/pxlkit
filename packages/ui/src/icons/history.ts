import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔙 History — 16×16 pixel art history / time-back icon
 *
 * Counter-clockwise circular arrow with a clear arrowhead at the bottom-left
 * pointing back — the universal "go back in time / undo history" pattern,
 * distinct from the `clock` icon (pure clock face) and the `undo` icon
 * (single hooked stroke).
 *
 *   B = Arrow blue (#5B9BD5)
 *   D = Dark edge  (#2E6DA4)
 */
export const History: PxlKitData = {
  name: 'history',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '.....BBBBBB.....',
    '...BBDDDDDDBB...',
    '..BBD......DBB..',
    '..BD........DB..',
    '.BD..........DB.',
    '.BD..........DB.',
    '.BD..........DB.',
    '.BD..........DB.',
    '..BD........DB..',
    '..BBD......BBB..',
    '.BBBBBBBBBBB....',
    'BBBBBB..........',
    '.BBB............',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
  },
  tags: ['history', 'undo', 'back', 'time', 'past', 'ui'],
  author: 'pxlkit',
};
