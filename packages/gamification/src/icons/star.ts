import type { PxlKitData } from '@pxlkit/core';

/**
 * ⭐ Star — 16×16 pixel art star icon
 *
 * A clean symmetric 5-pointed star for ratings and achievements.
 *
 * Palette:
 *   G = Gold (#FFD700)
 *   D = Dark gold edge (#B8860B)
 *   W = White shine (#FFFFFF)
 */
export const Star: PxlKitData = {
  name: 'star',
  size: 16,
  category: 'gamification',
  grid: [
    '........W.......',
    '.......GGG......',
    '.......GGG......',
    '......GGGGG.....',
    'GGGGGGGGGGGGGG..',
    '.GGGGGGGGGGGG...',
    '..WGGGGGGGGG....',
    '...GGGG.GGGG....',
    '..GGGG...GGGG...',
    '.DGGG.....DGD...',
    '.DGG.......DD...',
    '..DD............',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    'G': '#FFD700',
    'D': '#B8860B',
    'W': '#FFFFFF',
  },
  tags: ['star', 'rating', 'favorite', 'bookmark', 'reward', 'achievement'],
  author: 'pxlkit',
};
