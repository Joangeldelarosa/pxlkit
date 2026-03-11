import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔮 Amulet — 16×16 pixel art pendant amulet
 *
 * A silver chain holding a gold-framed red gemstone diamond pendant.
 *
 * Palette:
 *   C = Chain silver (#A0A8B8)
 *   G = Gold frame   (#FFD700)
 *   R = Red gem      (#DD2020)
 *   L = Gem shine    (#FF7070)
 */
export const Amulet: PxlKitData = {
  name: 'amulet',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '.......CC.......',
    '......C..C......',
    '.....C....C.....',
    '......C..C......',
    '.......CC.......',
    '......GGGG......',
    '.....GRRRLG.....',
    '....GRRRRRRG....',
    '...GRRLRRRRG....',
    '....GRRRRRG.....',
    '.....GGGGGG.....',
    '......GGGG......',
    '................',
    '................',
  ],
  palette: {
    C: '#A0A8B8',
    G: '#FFD700',
    R: '#DD2020',
    L: '#FF7070',
  },
  tags: ['amulet', 'pendant', 'gem', 'accessory', 'necklace', 'rpg'],
  author: 'pxlkit',
};
