import type { PxlKitData } from '@pxlkit/core';

/**
 * ⬆️ LevelUp — 16×16 pixel art level-up/XP icon
 *
 * An upward arrow with a star burst for leveling up.
 *
 * Palette:
 *   G = Green (#00CC66)
 *   L = Light green (#66FF99)
 *   D = Dark green (#009944)
 *   Y = Yellow glow (#FFD700)
 *   W = White (#FFFFFF)
 */
export const LevelUp: PxlKitData = {
  name: 'level-up',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......YWWY......',
    '.....YWLLWY.....',
    '....YWLLLLWY....',
    '...YWLLLLLLWY...',
    '....WLLDDLLW....',
    '.....WLDDLW.....',
    '......LDDL......',
    '......LDDL......',
    '......LDDL......',
    '......LDDL......',
    '......LDDL......',
    '.....LLDDLL.....',
    '....LDDDDDDL....',
    '....GDDDDDDG....',
    '................',
  ],
  palette: {
    'G': '#00CC66',
    'L': '#66FF99',
    'D': '#009944',
    'Y': '#FFD700',
    'W': '#FFFFFF',
  },
  tags: ['level-up', 'xp', 'experience', 'upgrade', 'progress', 'rank-up'],
  author: 'pxlkit',
};
