import type { PxlKitData } from '@pxlkit/core';

/**
 * 📦 LootChest — an OPEN treasure chest: the lid is raised (dark underside
 * showing) with gold spilling out the top over a wooden box. The old one read
 * as a closed chest with a gold band.
 *
 *   B = Brown wood (#8B4513)
 *   G = Gold trim (#FFD700)
 *   Y = Gold loot (#FFF176)
 *   D = Dark lid underside (#5C2E00)
 *   K = Keyhole (#1A0A00)
 */
export const LootChest: PxlKitData = {
  name: 'loot-chest',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '...GGGGGGGGGG...',
    '...GDDDDDDDDG...',
    '...GG.YYYY.GG...',
    '....YYYYYYYY....',
    '...YYYYYYYYYY...',
    '...GGGGGGGGGG...',
    '...GBBBKKBBBG...',
    '...GBBBBBBBBG...',
    '...GBBBBBBBBG...',
    '...GGGGGGGGGG...',
    '....BBBBBBBB....',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#8B4513',
    G: '#FFD700',
    Y: '#FFF176',
    D: '#5C2E00',
    K: '#1A0A00',
  },
  tags: ['loot', 'chest', 'treasure', 'reward', 'open', 'rpg'],
  author: 'pxlkit',
};
