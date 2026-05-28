import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚠️🚧 Caution — a centered, symmetric hazard triangle filled with bold
 * yellow/black diagonal stripes inside an orange border. Stronger than a plain
 * warning — physical danger / critical state.
 *
 *   O = Orange border (#E67E22)
 *   Y = Yellow stripe (#FFD700)
 *   B = Black stripe   (#1A1A1A)
 */
export const Caution: PxlKitData = {
  name: 'caution',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '................',
    '.......OO.......',
    '......OBBO......',
    '......OBYO......',
    '.....OBYYYO.....',
    '.....OYYYBO.....',
    '....OYYYBBBO....',
    '....OYYBBBYO....',
    '...OYYBBBYYYO...',
    '...OYBBBYYYBO...',
    '..OYBBBYYYBBBO..',
    '..OBBBYYYBBBYO..',
    '.OOOOOOOOOOOOOO.',
    '................',
    '................',
  ],
  palette: {
    O: '#E67E22',
    Y: '#FFD700',
    B: '#1A1A1A',
  },
  tags: ['caution', 'hazard', 'danger', 'warning', 'stripe', 'feedback'],
  author: 'pxlkit',
};
