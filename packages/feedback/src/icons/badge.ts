import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏅 Badge — round achievement badge: gold ring, blue field, a centered white
 * 5-point star, and a small gold ribbon nub below. Star is symmetric about the
 * vertical axis (the old one was a left-shifted bar).
 */
export const Badge: PxlKitData = {
  name: 'badge',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '.....GGGGGG.....',
    '...GGGGGGGGGG...',
    '..GGBBBBBBBBGG..',
    '..GBBBBWWBBBBG..',
    '.GBBBBBWWBBBBBG.',
    '.GBBWWWWWWWWBBG.',
    '.GBBBWWWWWWBBBG.',
    '..GBBWWBBWWBBG..',
    '..GGBBBBBBBBGG..',
    '...GGGGGGGGGG...',
    '.....GGGGGG.....',
    '......GDDG......',
    '......G..G......',
    '......GGGG......',
    '................',
  ],
  palette: {
    G: '#FFD700',
    D: '#B8860B',
    B: '#3498DB',
    W: '#FFFFFF',
  },
  tags: ['badge', 'achievement', 'award', 'certified', 'medal', 'feedback'],
  author: 'pxlkit',
};
