import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏹 Bow — a recurve bow: curved wooden limb ("(" shape) on the left with a
 * straight taut string (the chord) on the right. The old version was a full
 * circle with a bar through it (read as an eye/round shield).
 *
 *   B = Brown wood (#7B5E3A)
 *   S = String     (#D0C890)
 */
export const Bow: PxlKitData = {
  name: 'bow',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.........B......',
    '.......BBS......',
    '......BB.S......',
    '.....BB..S......',
    '....BB...S......',
    '....B....S......',
    '...B.....S......',
    '...B.....S......',
    '....B....S......',
    '....BB...S......',
    '.....BB..S......',
    '......BB.S......',
    '.......BBS......',
    '.........B......',
    '................',
  ],
  palette: {
    B: '#7B5E3A',
    S: '#D0C890',
  },
  tags: ['bow', 'weapon', 'archery', 'ranged', 'hunter', 'rpg'],
  author: 'pxlkit',
};
