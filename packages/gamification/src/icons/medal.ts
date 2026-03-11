import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏅 Medal — 16×16 pixel art medal icon
 *
 * A medal on a ribbon for awards and accomplishments.
 *
 * Palette:
 *   R = Ribbon red (#FF0000)
 *   D = Dark red (#CC0000)
 *   G = Gold (#FFD700)
 *   Y = Yellow (#FFF44F)
 *   K = Dark gold (#B8860B)
 */
export const Medal: PxlKitData = {
  name: 'medal',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '....RR...DD.....',
    '...RRR...DDD....',
    '....RRRRDDDD....',
    '.....RRRRDDD....',
    '......RRDD......',
    '....GGGGGGGG....',
    '...GWYYYYYYGG...',
    '..GWYKKKKKKYGG..',
    '..GWYKYYYYKYGG..',
    '..GWYKYGGYKYGG..',
    '..GWYKYYYYKYGG..',
    '..GGYKKKKKKYGG..',
    '...GGYYYYYYGG...',
    '....GGGGGGGG....',
    '................',
  ],
  palette: {
    'R': '#FF0000',
    'D': '#CC0000',
    'G': '#FFD700',
    'Y': '#FFF44F',
    'K': '#B8860B',
    'W': '#FFFFFF',
  },
  tags: ['medal', 'award', 'badge', 'achievement', 'honor', 'ribbon'],
  author: 'pxlkit',
};
