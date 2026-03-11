import type { PxlKitData } from '@pxlkit/core';

/**
 * 💎 Gem — 16×16 pixel art gemstone icon
 *
 * A sparkling diamond/gem for premium items and rewards.
 *
 * Palette:
 *   C = Cyan (#00CED1)
 *   L = Light cyan (#7FFFD4)
 *   D = Dark cyan (#008B8B)
 *   W = White shine (#FFFFFF)
 *   B = Blue (#1E90FF)
 */
export const Gem: PxlKitData = {
  name: 'gem',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '....DDDDDDDD....',
    '...DLLCCCCCCB...',
    '..DWLCCCCCCCCB..',
    '..DWLCCCCCCCCB..',
    '..BDDLCCCCCDB...',
    '...BDDLCCCDBB...',
    '....BDDLCDB.....',
    '.....BDDDB......',
    '......BDB.......',
    '.......B........',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    'C': '#00CED1',
    'L': '#7FFFD4',
    'D': '#008B8B',
    'W': '#FFFFFF',
    'B': '#1E90FF',
  },
  tags: ['gem', 'diamond', 'jewel', 'crystal', 'premium', 'rare'],
  author: 'pxlkit',
};
