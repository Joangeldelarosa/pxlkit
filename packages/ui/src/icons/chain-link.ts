import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔗 ChainLink — 16×16 pixel art chain link / hyperlink
 *
 * Two interlocked ring halves drawn on a diagonal — the universal
 * hyperlink / chain icon. Each half-ring leans into the other so the
 * silhouette reads as a connected pair at 16 px instead of a blob.
 *
 *   B = Blue link  (#5B9BD5)
 *   D = Dark edge  (#2E6DA4)
 */
export const ChainLink: PxlKitData = {
  name: 'chain-link',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '...BBBB.........',
    '..BDDDDB........',
    '.BD....DB.......',
    '.BD....DBBBB....',
    '..BD..DBDDDDB...',
    '...BBBB.....DB..',
    '............DB..',
    '..BD........DB..',
    '..BDDDB.....DB..',
    '.BD....DB..DB...',
    '.BD....DBBBB....',
    '..BD..DB........',
    '...BBBB.........',
    '................',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
  },
  tags: ['link', 'chain', 'url', 'hyperlink', 'connect', 'ui'],
  author: 'pxlkit',
};
