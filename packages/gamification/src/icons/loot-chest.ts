import type { PxlKitData } from '@pxlkit/core';

/**
 * 📦 LootChest — 16×16 pixel art open treasure chest
 *
 * An open wooden chest overflowing with gold, with a raised lid.
 * Distinct from the closed Chest icon (lid is raised, contents visible).
 *
 * Palette:
 *   B = Brown wood  (#8B4513)
 *   D = Dark wood   (#5C2E00)
 *   G = Gold trim   (#FFD700)
 *   Y = Gold loot   (#FFF176)
 *   K = Keyhole     (#1A0A00)
 */
export const LootChest: PxlKitData = {
  name: 'loot-chest',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '...GGGGGGGGG....',
    '..GBBBBBBBBGG...',
    '..GBBGYYYYBGG...',
    '..GGGGGGGGGG....',
    '..GBBBBBBBBBG...',
    '..GBBBGKGBBBBG..',
    '..GBBBBBBBBBBG..',
    '..GBBBBBBBBBBG..',
    '..GGGGGGGGGGGG..',
    '...BBBBBBBBBB...',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#8B4513',
    D: '#5C2E00',
    G: '#FFD700',
    Y: '#FFF176',
    K: '#1A0A00',
  },
  tags: ['loot', 'chest', 'treasure', 'reward', 'open', 'rpg'],
  author: 'pxlkit',
};
