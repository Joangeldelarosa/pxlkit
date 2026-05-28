import type { PxlKitData } from '@pxlkit/core';

/**
 * 🧭 QuestCompass — a gold ring with a bicolor needle (white North, red South).
 * The old version was a sparse gold asterisk that read as a pinwheel.
 *
 *   G = Gold ring  (#D4A400)
 *   W = North tip  (#FFFFFF)
 *   R = South tip  (#FF2020)
 */
export const QuestCompass: PxlKitData = {
  name: 'quest-compass',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.....GGGGGG.....',
    '...GG......GG...',
    '..G..........G..',
    '..G....WW....G..',
    '.G....WWWW....G.',
    '.G...WWWWWW...G.',
    '.G...WWWWWW...G.',
    '.G...RRRRRR...G.',
    '.G...RRRRRR...G.',
    '..G...RRRR...G..',
    '..G....RR....G..',
    '...GG......GG...',
    '.....GGGGGG.....',
    '................',
    '................',
  ],
  palette: {
    G: '#D4A400',
    W: '#FFFFFF',
    R: '#FF2020',
  },
  tags: ['compass', 'navigation', 'direction', 'quest', 'map', 'rpg'],
  author: 'pxlkit',
};
