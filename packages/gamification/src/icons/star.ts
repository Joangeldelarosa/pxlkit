import type { PxlKitData } from '@pxlkit/core';

/**
 * ⭐ Star — a clean 5-pointed star, mirror-symmetric about the vertical centre
 * line (every row mirrors col i ↔ col 15-i). The old one had an off-centre
 * apex and unmatched arms/legs.
 *
 *   G = Gold (#FFD700)
 *   D = Dark gold edge (#B8860B)
 *   W = White shine (#FFFFFF)
 */
export const Star: PxlKitData = {
  name: 'star',
  size: 16,
  category: 'gamification',
  grid: [
    '.......GG.......',
    '.......WW.......',
    '......GGGG......',
    '......GGGG......',
    'GGGGGGGGGGGGGGGG',
    '.GGGGGGGGGGGGGG.',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '..GGGGG..GGGGG..',
    '..GGG......GGG..',
    '.DGG........GGD.',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#FFD700',
    D: '#B8860B',
    W: '#FFFFFF',
  },
  tags: ['star', 'rating', 'favorite', 'bookmark', 'reward', 'achievement'],
  author: 'pxlkit',
};
