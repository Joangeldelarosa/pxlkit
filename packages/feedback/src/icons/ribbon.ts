import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎀 Ribbon — 16×16 pixel art award ribbon
 *
 * A vertical medal ribbon with a circular award medallion at the bottom.
 *
 * Palette:
 *   R = Red ribbon  (#E74C3C)
 *   D = Dark red    (#A93226)
 *   G = Gold medal  (#FFD700)
 *   B = Dark gold   (#B8860B)
 *   W = White shine (#FFFFFF)
 */
export const Ribbon: PxlKitData = {
  name: 'ribbon',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '......RRRR......',
    '.....RRDDRR.....',
    '.....RR..RR.....',
    '....RR....RR....',
    '....RD....DR....',
    '.....RR..RR.....',
    '.....RRRRRR.....',
    '......RRRR......',
    '.....GGGGGG.....',
    '....GGWWWWGG....',
    '....GGWBBWGG....',
    '....GGWWWWGG....',
    '.....GGGGGG.....',
    '................',
    '................',
  ],
  palette: {
    R: '#E74C3C',
    D: '#A93226',
    G: '#FFD700',
    B: '#B8860B',
    W: '#FFFFFF',
  },
  tags: ['ribbon', 'award', 'prize', 'first-place', 'winner', 'feedback'],
  author: 'pxlkit',
};
