import type { PxlKitData } from '@pxlkit/core';

/**
 * 💣 Bomb — 16×16 pixel art bomb icon
 *
 * A classic round bomb for special attacks and power moves.
 *
 * Palette:
 *   K = Black body (#333333)
 *   D = Dark gray (#555555)
 *   G = Gray highlight (#888888)
 *   O = Orange spark (#FF8C00)
 *   Y = Yellow spark (#FFD700)
 *   R = Red fuse (#FF0000)
 */
export const Bomb: PxlKitData = {
  name: 'bomb',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..........YO....',
    '.........OY.....',
    '........RR......',
    '.......RR.......',
    '......DKKD......',
    '.....DKKKKD.....',
    '....DKGKKKKKD...',
    '....DKKKKKKKKD..',
    '...DKGKKKKKKD...',
    '...DKKKKKKKKKD..',
    '...DKKKKKKKKKD..',
    '....DKKKKKKKD...',
    '....DDKKKKKDD...',
    '.....DDDDDDD....',
    '................',
  ],
  palette: {
    'K': '#333333',
    'D': '#555555',
    'G': '#888888',
    'O': '#FF8C00',
    'Y': '#FFD700',
    'R': '#FF0000',
  },
  tags: ['bomb', 'explosive', 'attack', 'power', 'special', 'blast'],
  author: 'pxlkit',
};
