import type { PxlKitData } from '@pxlkit/core';

/**
 * 🐛 Bug — 16×16 pixel art software bug
 *
 * A red bug icon representing a software defect or issue.
 *
 * Palette:
 *   R = Red body    (#E74C3C)
 *   D = Dark red    (#A93226)
 *   B = Black legs  (#1A1A1A)
 *   W = White eyes  (#FFFFFF)
 *   G = Green eye   (#27AE60)
 */
export const Bug: PxlKitData = {
  name: 'bug',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '...BB.....BB....',
    '..BBB.....BBB...',
    '....RRRRRRR.....',
    '...RRWRRWRRRR...',
    '...RRRRRRRRR....',
    'BB.RRRRRRRRR.BB.',
    'BB.RRDDDDDDR.BB.',
    'BB.RRRRRRRRR.BB.',
    '...RRRRRRRRR....',
    '...RRRRRRRRRR...',
    '....RRRRRRR.....',
    '..BBB.....BBB...',
    '..BB.......BB...',
    '................',
    '................',
  ],
  palette: {
    R: '#E74C3C',
    D: '#A93226',
    B: '#1A1A1A',
    W: '#FFFFFF',
    G: '#27AE60',
  },
  tags: ['bug', 'error', 'issue', 'defect', 'debug', 'feedback'],
  author: 'pxlkit',
};
