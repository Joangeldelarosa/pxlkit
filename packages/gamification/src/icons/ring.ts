import type { PxlKitData } from '@pxlkit/core';

/**
 * 💍 Ring — 16×16 pixel art gemstone ring
 *
 * A gold ring with a deep red ruby stone set on top.
 *
 * Palette:
 *   G = Gold   (#FFD700)
 *   D = Dark gold (#B8860B)
 *   R = Ruby   (#CC2020)
 *   L = Light ruby (#FF6060)
 */
export const Ring: PxlKitData = {
  name: 'ring',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......RRLR......',
    '.....RLLRRR.....',
    '....RR....RR....',
    '...GG......GG...',
    '..GG........GG..',
    '..GG........GG..',
    '..GG........GG..',
    '..GG........GG..',
    '...GG......GG...',
    '....GG....GG....',
    '.....GGGGGG.....',
    '......GGGG......',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#FFD700',
    D: '#B8860B',
    R: '#CC2020',
    L: '#FF6060',
  },
  tags: ['ring', 'gem', 'ruby', 'accessory', 'jewelry', 'rpg'],
  author: 'pxlkit',
};
