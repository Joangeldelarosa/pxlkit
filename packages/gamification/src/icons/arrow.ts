import type { PxlKitData } from '@pxlkit/core';

/**
 * 🏹 Arrow — 16×16 pixel art arrow icon
 *
 * A pointed arrow for direction, quests, and ranged attacks.
 *
 * Palette:
 *   S = Steel tip (#C0C0C0)
 *   D = Dark steel (#708090)
 *   B = Brown shaft (#8B4513)
 *   L = Light brown (#CD853F)
 *   G = Green feather (#228B22)
 */
export const Arrow: PxlKitData = {
  name: 'arrow',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '................',
    '..GG............',
    '.GGGG...........',
    '..GGLBBBBB......',
    '...GLLBBBBBSS...',
    '....LLLLBBBBSSSW',
    '....LLLLBBBBSSSW',
    '...GLLBBBBBSS...',
    '..GGLBBBBB......',
    '.GGGG...........',
    '..GG............',
    '................',
    '................',
    '................',
  ],
  palette: {
    'S': '#C0C0C0',
    'B': '#8B4513',
    'L': '#CD853F',
    'G': '#228B22',
    'W': '#FFFFFF',
  },
  tags: ['arrow', 'projectile', 'direction', 'quest', 'ranged', 'bow'],
  author: 'pxlkit',
};
