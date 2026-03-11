import type { PxlKitData } from '@pxlkit/core';

/**
 * 👢 Boots — 16×16 pixel art pair of leather boots
 *
 * Two brown leather boots seen from the front.
 *
 * Palette:
 *   B = Brown leather (#8B4513)
 *   D = Dark shadow   (#4A2208)
 *   L = Light tone    (#A0552A)
 */
export const Boots: PxlKitData = {
  name: 'boots',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '..BBB......BBB..',
    '..BBB......BBB..',
    '..BBB......BBB..',
    '..BBB......BBB..',
    '..BBB......BBB..',
    '..BBBB....BBBB..',
    '..DBBBBB.DBBBBB.',
    '..DBBBBBBDBBBBB.',
    '..DBBBBBBBBBBBD.',
    '..DDDDDDDDDDDDD.',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#8B4513',
    D: '#4A2208',
    L: '#A05028',
  },
  tags: ['boots', 'shoes', 'leather', 'speed', 'equipment', 'rpg'],
  author: 'pxlkit',
};
