import type { PxlKitData } from '@pxlkit/core';

/**
 * 👥 Community — 16×16 pixel art community / group of people
 *
 * Three silhouetted figures together — community, group, or team.
 *
 * Palette:
 *   H = Head blue   (#5B9BD5)
 *   B = Body blue   (#4A7EBF)
 *   D = Dark body   (#2E5490)
 *   L = Light head  (#7DB8F7)
 */
export const Community: PxlKitData = {
  name: 'community',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '....HH...HH.....',
    '...HHHH.HHHH....',
    '....HH...HH.....',
    '...BBBB.BBBB....',
    '..BBBBBB.BBB....',
    '.BBBBBB..BBBB...',
    '..BBBB...BBBB...',
    '.HH.......HH....',
    'HHH.......HHH...',
    '.HH...HH...HH...',
    'BBB..HHHH..BBB..',
    '.BB.BBBBBB.BB...',
    '.BB.BBBBBB.BB...',
    '.BBBBBBBBBBBB...',
    '................',
  ],
  palette: {
    H: '#5B9BD5',
    B: '#4A7EBF',
    D: '#2E5490',
    L: '#7DB8F7',
  },
  tags: ['community', 'group', 'team', 'people', 'users', 'social'],
  author: 'pxlkit',
};
