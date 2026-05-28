import type { PxlKitData } from '@pxlkit/core';

/**
 * ⬆️ LevelUp — a bold green up-arrow above a base bar (the "level"). The old
 * one had a wide cup-like base that read as a chalice/mushroom.
 *
 *   G = Green (#00CC66)
 *   L = Light green highlight (#66FF99)
 *   Y = Yellow glow (#FFD700)
 */
export const LevelUp: PxlKitData = {
  name: 'level-up',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......Y........',
    '......GGG.......',
    '.....LGGGG......',
    '....LGGGGGG.....',
    '...LGGGGGGGG....',
    '..LGGGGGGGGGG...',
    '......GGGG......',
    '......LGGG......',
    '......LGGG......',
    '......LGGG......',
    '......LGGG......',
    '................',
    '...GGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '................',
  ],
  palette: {
    G: '#00CC66',
    L: '#66FF99',
    Y: '#FFD700',
  },
  tags: ['level-up', 'xp', 'experience', 'upgrade', 'progress', 'rank-up'],
  author: 'pxlkit',
};
