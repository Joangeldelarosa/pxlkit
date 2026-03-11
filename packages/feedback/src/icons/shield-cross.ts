import type { PxlKitData } from '@pxlkit/core';

/**
 * 🛡️✕ ShieldCross — 16×16 pixel art shield with an X
 *
 * A red shield with a white × mark — access denied, blocked, or failed protection.
 *
 * Palette:
 *   R = Red shield  (#E74C3C)
 *   D = Dark red    (#A93226)
 *   W = White X     (#FFFFFF)
 *   S = Shield edge (#C0392B)
 */
export const ShieldCross: PxlKitData = {
  name: 'shield-cross',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '....RRRRRRR.....',
    '...RRRRRRRRRR...',
    '..RRRSWWWWSRRRR.',
    '..RRSWWRSWWSRRR.',
    '..RRWWWWWWWWRRR.',
    '..RRWWRWRWWRRR..',
    '..RRSWWWWWSRRR..',
    '..RRSWWSWWSRRR..',
    '..RRRSWWWSRRRR..',
    '...RRRRRRRRRR...',
    '....RRRRRRRRR...',
    '.....RRRRRRR....',
    '......RRRRR.....',
    '.......RRR......',
    '........R.......',
  ],
  palette: {
    R: '#E74C3C',
    D: '#A93226',
    W: '#FFFFFF',
    S: '#C0392B',
  },
  tags: ['shield', 'cross', 'block', 'deny', 'fail', 'security', 'feedback'],
  author: 'pxlkit',
};
