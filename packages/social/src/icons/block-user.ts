import type { PxlKitData } from '@pxlkit/core';

/**
 * 🚫 BlockUser — 16×16 pixel art block user
 *
 * A person silhouette overlaid with a red circle-slash — block or ban.
 *
 * Palette:
 *   H = Head grey   (#8899AA)
 *   B = Body grey   (#778899)
 *   R = Red circle  (#E74C3C)
 *   D = Dark red    (#C0392B)
 */
export const BlockUser: PxlKitData = {
  name: 'block-user',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '....HHH.........', 
    '...HHHHH........',
    '....HHH.........',
    '...BBBBB........',
    '..BBBBBBB.......',
    '...BBBBB........',
    '...BBBBB........',
    '..BBBBBBB..RRRRR',
    '..BBBBBBB.RRDRRR',
    '..BBBBBBB.RRRDRR',
    '..BBBBBBB..RDDDD',
    '..BBBBBBB....RR.',
    '..BBBBBBBBB.....',
    '................',
    '................',
  ],
  palette: {
    H: '#8899AA',
    B: '#778899',
    R: '#E74C3C',
    D: '#C0392B',
  },
  tags: ['block', 'ban', 'restrict', 'user', 'social'],
  author: 'pxlkit',
};
