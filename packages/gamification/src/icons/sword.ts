import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚔️ Sword — 16×16 pixel art sword icon
 *
 * A steel blade with golden crossguard and brown grip.
 *
 * Palette:
 *   S = Steel (#C0C0C0)
 *   W = White shine (#FFFFFF)
 *   G = Gold crossguard (#FFD700)
 *   B = Brown grip (#8B4513)
 *   D = Dark steel (#708090)
 */
export const Sword: PxlKitData = {
  name: 'sword',
  size: 16,
  category: 'gamification',
  grid: [
    '...............W',
    '..............WS',
    '.............WSD',
    '............WSD.',
    '...........WSD..',
    '..........WSD...',
    '.........WSD....',
    '........WSD.....',
    '.......WSD......',
    '......WSD.......',
    '...GGGWGD.......',
    '..G.GGG.........',
    '.G...BBD........',
    '....BBD.........',
    '...BBD..........',
    '...DD...........',
  ],
  palette: {
    'S': '#C0C0C0',
    'W': '#FFFFFF',
    'G': '#FFD700',
    'B': '#8B4513',
    'D': '#708090',
  },
  tags: ['sword', 'weapon', 'attack', 'combat', 'blade', 'rpg'],
  author: 'pxlkit',
};
