import type { PxlKitData } from '@pxlkit/core';

/**
 * ✅✅ DoubleCheck — 16×16 pixel art double checkmark
 *
 * Two overlapping green checkmarks — "read" or "confirmed" status.
 *
 * Palette:
 *   G = Green check (#00CC66)
 *   D = Dark green  (#008844)
 */
export const DoubleCheck: PxlKitData = {
  name: 'double-check',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '................',
    '................',
    '.....G.....G....',
    '....GG....GG....',
    '...GGG...GGG....',
    'G.GGGG.GGGGG....',
    'GGGGGGGGGGGG....',
    '.GGGGG.GGGGG....',
    '..GGG...GGGG....',
    '...G.....GGG....',
    '.........GG.....',
    '..........G.....',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#00CC66',
    D: '#008844',
  },
  tags: ['double-check', 'read', 'confirmed', 'done', 'tick', 'feedback'],
  author: 'pxlkit',
};
