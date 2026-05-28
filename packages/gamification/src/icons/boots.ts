import type { PxlKitData } from '@pxlkit/core';

/**
 * 👢 Boots — a single leather boot in side view (L-shape): a tall shaft with
 * the foot extending to the right and a dark sole. The old version was two
 * front-view columns that read as a "U".
 *
 *   B = Brown leather (#8B4513)
 *   L = Light tone    (#A0552A)
 *   D = Dark sole     (#4A2208)
 */
export const Boots: PxlKitData = {
  name: 'boots',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '.....BBBB.......',
    '.....LBBB.......',
    '.....LBBB.......',
    '.....LBBB.......',
    '.....LBBB.......',
    '.....LBBB.......',
    '.....LBBBB......',
    '.....LBBBBBB....',
    '.....LBBBBBBBB..',
    '....DDDDDDDDDD..',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#8B4513',
    L: '#A05028',
    D: '#4A2208',
  },
  tags: ['boots', 'shoes', 'leather', 'speed', 'equipment', 'rpg'],
  author: 'pxlkit',
};
