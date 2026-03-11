import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏹 Bow — 16×16 pixel art bow (weapon)
 *
 * A wooden recurve bow with taut string.
 *
 * Palette:
 *   B = Brown wood (#7B5E3A)
 *   S = String     (#D0C890)
 */
export const Bow: PxlKitData = {
  name: 'bow',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..BBBBBBBBB.....',
    '.B.........B....',
    'B...........B...',
    'B.....S.....B...',
    'B.....S.....B...',
    'B.....S.....B...',
    'B.....S.....B...',
    'B.....S.....B...',
    'B.....S.....B...',
    'B.....S.....B...',
    'B...........B...',
    '.B.........B....',
    '..BBBBBBBBB.....',
    '................',
    '................',
  ],
  palette: {
    B: '#7B5E3A',
    S: '#D0C890',
  },
  tags: ['bow', 'weapon', 'archery', 'ranged', 'hunter', 'rpg'],
  author: 'pxlkit',
};
