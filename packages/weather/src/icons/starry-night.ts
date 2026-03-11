import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌌 StarryNight — 16×16 pixel art starry night sky
 *
 * A deep navy sky scattered with stars of varying brightness.
 *
 * Palette:
 *   N = Navy dark  (#0D1B2A)
 *   S = Star white (#FFFFFF)
 *   G = Star glow  (#CCDDFF)
 *   Y = Star gold  (#FFD700)
 */
export const StarryNight: PxlKitData = {
  name: 'starry-night',
  size: 16,
  category: 'weather',
  grid: [
    '.......S........',
    '.......S........',
    '...S.......S....',
    '...S.......S....',
    '.......YG.......',
    '.......YG.......',
    '..G.............',
    '..G.............',
    '..........S.....',
    '..........S.....',
    '..S.............',
    '................',
    '....S.......G...',
    '....S.......G...',
    '................',
    '................',
  ],
  palette: {
    N: '#0D1B2A',
    S: '#FFFFFF',
    G: '#CCDDFF',
    Y: '#FFD700',
  },
  tags: ['stars', 'night', 'sky', 'space', 'galaxy', 'weather'],
  author: 'pxlkit',
};
