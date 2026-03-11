import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎯 FeedbackTarget — 16×16 pixel art target/aim reticle
 *
 * A circular target reticle with concentric red and white rings.
 * Used for goals, objectives, and precision feedback.
 *
 * Palette:
 *   R = Red ring    (#E74C3C)
 *   W = White ring  (#FFFFFF)
 *   D = Dark red    (#A93226)
 */
export const FeedbackTarget: PxlKitData = {
  name: 'feedback-target',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '.....RRRRR......',
    '...RRWWWWWRR....',
    '..RWWWRRRRWWR...',
    '.RWWRR....RRWR..',
    '.RWRR......RRW..',
    '.RWR...RR...RW..',
    '.RWR..RDRR..RW..',
    '.RWR...RR...RW..',
    '.RWRR......RRW..',
    '.RWWRR....RRWR..',
    '..RWWWRRRRWWR...',
    '...RRWWWWWRR....',
    '.....RRRRR......',
    '................',
    '................',
  ],
  palette: {
    R: '#E74C3C',
    W: '#FFFFFF',
    D: '#A93226',
  },
  tags: ['target', 'aim', 'goal', 'objective', 'focus', 'feedback'],
  author: 'pxlkit',
};
