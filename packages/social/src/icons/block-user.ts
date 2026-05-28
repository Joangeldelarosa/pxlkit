import type { PxlKitData } from '@pxlkit/core';

/**
 * 🚫 BlockUser — 16×16 pixel art block user
 *
 * Blue person silhouette (matching add-user / remove-user for family coherence)
 * with a small red 3×3 badge containing a white diagonal slash — block or ban.
 *
 * Palette:
 *   H = Head blue   (#5B9BD5)
 *   B = Body blue   (#4A7EBF)
 *   R = Red badge   (#E74C3C)
 *   W = White slash (#FFFFFF)
 */
export const BlockUser: PxlKitData = {
  name: 'block-user',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....HHH........',
    '....HHHHH.......',
    '.....HHH........',
    '....BBBBB.......',
    '...BBBBBBB......',
    '....BBBBB.......',
    '....BBBBB.......',
    '...BBBBBBB......',
    '...BBBBBBB...RRW',
    '...BBBBBBB...RWR',
    '...BBBBBBB...WRR',
    '...BBBBBBB......',
    '...BBBBBBBBB....',
    '................',
    '................',
  ],
  palette: {
    H: '#5B9BD5',
    B: '#4A7EBF',
    R: '#E74C3C',
    W: '#FFFFFF',
  },
  tags: ['block', 'ban', 'restrict', 'user', 'social'],
  author: 'pxlkit',
};
