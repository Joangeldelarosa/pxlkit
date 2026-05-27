import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎖️ Ribbon — award ribbon: a gold medallion with two forked red ribbon
 * tails hanging below. Centered and symmetric; reads as a prize/award rather
 * than a generic red blob.
 */
export const Ribbon: PxlKitData = {
  name: 'ribbon',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '......GGGG......',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '...GGGWWWWGGG...',
    '...GGGWWWWGGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '.....RRRRRR.....',
    '....RRR..RRR....',
    '....RR....RR....',
    '....RR....RR....',
    '...RR......RR...',
    '...R........R...',
    '................',
    '................',
  ],
  palette: {
    G: '#FFD700',
    W: '#FFFFFF',
    R: '#E03131',
  },
  tags: ['ribbon', 'award', 'prize', 'first-place', 'winner', 'feedback'],
  author: 'pxlkit',
};
