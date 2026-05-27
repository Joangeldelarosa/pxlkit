import type { PxlKitData } from '@pxlkit/core';

/**
 * 🥇 Ribbon — an award medal hanging from a folded ribbon. The ribbon meets at
 * a point at the TOP (a hook/fold) and opens into two bands that attach to the
 * gold disc below, which carries a white star. Ribbon-on-top inverts the
 * composition so it can't read as a character (the disc-over-tails failure).
 */
export const Ribbon: PxlKitData = {
  name: 'ribbon',
  size: 16,
  category: 'feedback',
  grid: [
    '.......RR.......',
    '......RRRR......',
    '......R..R......',
    '.....RR..RR.....',
    '....RR....RR....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGWWGGGGG..',
    '..GGGGWWWWGGGG..',
    '..GGGGGWWGGGGG..',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '................',
    '................',
  ],
  palette: {
    G: '#FFD700',
    W: '#FFFFFF',
    R: '#E03131',
  },
  tags: ['ribbon', 'award', 'prize', 'first-place', 'winner', 'medal', 'feedback'],
  author: 'pxlkit',
};
