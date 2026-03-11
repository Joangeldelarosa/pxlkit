import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚗️ Elixir — 16×16 pixel art golden buff elixir
 *
 * A small round bottle with golden liquid — the ultimate potion.
 *
 * Palette:
 *   K = Cork        (#654321)
 *   E = Elixir gold (#FFD700)
 *   L = Light shine (#FFFACD)
 *   D = Dark glass  (#B8860B)
 *   W = White shine (#FFFFFF)
 */
export const Elixir: PxlKitData = {
  name: 'elixir',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '........K.......',
    '.......KK.......',
    '.......KK.......',
    '......KDDK......',
    '.....DDEEDD.....',
    '....DDEEWEEDD...',
    '....DEEEEEEED...',
    '...DDEELLEEDD...',
    '...DEEEEEEEEED..',
    '...DEEEWWEEEED..',
    '....DEEEEEEED...',
    '....DDEEEEEDD...',
    '.....DDEEEDD....',
    '......DDDDD.....',
    '................',
  ],
  palette: {
    K: '#654321',
    E: '#FFD700',
    L: '#FFFACD',
    D: '#B8860B',
    W: '#FFFFFF',
  },
  tags: ['elixir', 'potion', 'buff', 'golden', 'ultimate', 'consumable', 'rpg'],
  author: 'pxlkit',
};
