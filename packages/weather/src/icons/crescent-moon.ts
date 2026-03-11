import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌙 CrescentMoon — 16×16 pixel art crescent moon
 *
 * A classic golden crescent moon facing right — night, sleep, nocturnal.
 *
 * Palette:
 *   Y = Moon gold  (#F0C040)
 *   D = Dark edge  (#C89020)
 *   L = Light glow (#F8E080)
 */
export const CrescentMoon: PxlKitData = {
  name: 'crescent-moon',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '........DYYY....',
    '......DYYYYY....',
    '.....DYYYYYYY...',
    '....DYYYYLYYYY..',
    '....DYYYYYLYY...',
    '....DYYYYYLYY...',
    '....DYYYYYLYYY..',
    '....DYYYYLLYYYY.',
    '....DYYYYYYYYY..',
    '.....DYYYYYYYY..',
    '......DYYYYY....',
    '........DYYY....',
    '................',
    '................',
    '................',
  ],
  palette: {
    Y: '#F0C040',
    D: '#C89020',
    L: '#F8E080',
  },
  tags: ['moon', 'crescent', 'night', 'sleep', 'nocturnal', 'weather'],
  author: 'pxlkit',
};
