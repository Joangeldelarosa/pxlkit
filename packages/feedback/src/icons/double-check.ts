import type { PxlKitData } from '@pxlkit/core';

/**
 * ✅✅ DoubleCheck — two overlapping checkmarks ("read" / "confirmed"). The back
 * tick is dark green and the front tick is bright green, separated by a gap so
 * the pair reads as TWO checks rather than one fused blob.
 *
 *   G = Bright green front tick (#00CC66)
 *   D = Dark green back tick (#008844)
 */
export const DoubleCheck: PxlKitData = {
  name: 'double-check',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '................',
    '.....D.....G....',
    '....DD....GG....',
    '...DDD...GGG....',
    'D.DDDD.GGGGG....',
    'DDDDDD.GGGGG....',
    '.DDDDD.GGGGG....',
    '..DDD...GGGG....',
    '...D.....GGG....',
    '.........GG.....',
    '..........G.....',
    '................',
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
