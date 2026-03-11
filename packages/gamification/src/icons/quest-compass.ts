import type { PxlKitData } from '@pxlkit/core';

/**
 * 🧭 QuestCompass — 16×16 pixel art RPG compass
 *
 * A compass rose with a white north point, red south needle,
 * and gold east/west arms. Used in navigation and quests.
 *
 * Palette:
 *   G = Gold body  (#D4A400)
 *   N = North tip  (#FFFFFF)
 *   R = South tip  (#FF2020)
 *   D = Dark ring  (#7B6000)
 */
export const QuestCompass: PxlKitData = {
  name: 'quest-compass',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......N........',
    '......NNN.......',
    '.......G........',
    '....G..G..G.....',
    '...GGG.G.GGG....',
    '....G..G..G.....',
    '...GGGDGGDGG....',
    '....G..R..G.....',
    '...GGG.R.GGG....',
    '....G..R..G.....',
    '.......R........',
    '......RRR.......',
    '.......R........',
    '................',
    '................',
  ],
  palette: {
    G: '#D4A400',
    N: '#FFFFFF',
    R: '#FF2020',
    D: '#7B6000',
  },
  tags: ['compass', 'navigation', 'direction', 'quest', 'map', 'rpg'],
  author: 'pxlkit',
};
