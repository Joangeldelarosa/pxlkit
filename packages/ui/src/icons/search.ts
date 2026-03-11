import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔍 Search — 16×16 pixel art search magnifying glass
 *
 * A circular lens with a handle — find, search, query, filter.
 *
 * Palette:
 *   G = Glass blue (#B0D4EE)
 *   O = Outline    (#334455)
 *   H = Handle     (#556677)
 */
export const Search: PxlKitData = {
  name: 'search',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '....OOOOO.......',
    '...OPGGGGO......',
    '..OPGGGGGGGH....',
    '..OGGGGGGGGO....',
    '..OGGGGGGGGO....',
    '..OPGGGGGGGH....',
    '...OOOOOOO......',
    '....OOOOO.H.....',
    '.........HH.....',
    '..........HH....',
    '...........HH...',
    '............HH..',
    '.............H..',
    '................',
    '................',
  ],
  palette: {
    G: '#B0D4EE',
    O: '#334455',
    H: '#556677',
    P: '#8BBBD4',
  },
  tags: ['search', 'find', 'query', 'magnify', 'ui'],
  author: 'pxlkit',
};
