import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚠️🚧 Caution — 16×16 pixel art caution/hazard stripes
 *
 * Yellow and black diagonal hazard stripes inside a warning border.
 * Stronger than a regular warning — physical danger or critical state.
 *
 * Palette:
 *   Y = Yellow stripes (#FFD700)
 *   B = Black stripes  (#1A1A1A)
 *   O = Orange border  (#E67E22)
 */
export const Caution: PxlKitData = {
  name: 'caution',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '.......OO.......',
    '......OOOO......',
    '.....OOBBOO.....',
    '....OOBYYBO.....',
    '....OBYYYYBO....',
    '...OBBYYBBYBO...',
    '...OBYYYYBYBO...',
    '..OBBYYBBYYBO...',
    '..OBYYYYBYYBOO..',
    '.OBBYYBBYYBBOO..',
    '.OBBBBBBBBBBOOO.',
    'OOOOOOOOOOOOOOOO',
    '................',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    B: '#1A1A1A',
    O: '#E67E22',
  },
  tags: ['caution', 'hazard', 'danger', 'warning', 'stripe', 'feedback'],
  author: 'pxlkit',
};
