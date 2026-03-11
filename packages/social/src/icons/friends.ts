import type { PxlKitData } from '@pxlkit/core';

/**
 * 👫 Friends — 16×16 pixel art two friends side by side
 *
 * A male and female figure side by side with connected arms — friendship.
 *
 * Palette:
 *   A = Person A blue (#5B9BD5)
 *   B = Person B pink (#E91E8C)
 *   D = Dark shared   (#2E5490)
 *   L = Light         (#7DB8F7)
 *   P = Pink light    (#F48FC8)
 */
export const Friends: PxlKitData = {
  name: 'friends',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '................',
    '...AAA...BBB....',
    '..AAAAA.BBBBB...',
    '...AAA...BBB....',
    '..AAAAA.BBBBB...',
    '.AAAAAABBBBBB...',
    '..AAAA..BBBB....',
    '..AAAA..BBBB....',
    '..AAAA..BBBB....',
    '.AAAAAA.BBBBB...',
    '.AAAAAA.BBBBB...',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    A: '#5B9BD5',
    B: '#E91E8C',
    D: '#2E5490',
    L: '#7DB8F7',
    P: '#F48FC8',
  },
  tags: ['friends', 'couple', 'together', 'pair', 'social'],
  author: 'pxlkit',
};
