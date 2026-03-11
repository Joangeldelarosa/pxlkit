import type { PxlKitData } from '@pxlkit/core';

/**
 * ✨ MagicWand — 16×16 pixel art magic wand
 *
 * A wooden wand with a glowing golden star tip.
 *
 * Palette:
 *   G = Gold star  (#FFD700)
 *   Y = Glow halo  (#FFE44C)
 *   W = Shine      (#FFFFFF)
 *   B = Brown wand (#7B5B2A)
 *   D = Dark wood  (#5A3E1A)
 */
export const MagicWand: PxlKitData = {
  name: 'magic-wand',
  size: 16,
  category: 'gamification',
  grid: [
    '.......W........',
    '......WYW.......',
    '.....WYGYW......',
    '......WYW.......',
    '.......W........',
    '.......B........',
    '.......B........',
    '.......B........',
    '.......B........',
    '.......B........',
    '.......B........',
    '.......B........',
    '.......BD.......',
    '.......BD.......',
    '.......DD.......',
    '................',
  ],
  palette: {
    G: '#FFD700',
    Y: '#FFE44C',
    W: '#FFFFFF',
    B: '#7B5B2A',
    D: '#5A3E1A',
  },
  tags: ['wand', 'magic', 'spell', 'wizard', 'enchant', 'rpg'],
  author: 'pxlkit',
};
