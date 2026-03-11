import type { PxlKitData } from '@pxlkit/core';

/**
 * 💧 ManaPotion — 16×16 pixel art blue mana potion
 *
 * A rounded blue glass bottle with a cork stopper.
 *
 * Palette:
 *   K = Cork brown  (#654321)
 *   P = Blue potion (#4060FF)
 *   L = Shine       (#A0B0FF)
 *   D = Dark glass  (#2030A0)
 *   W = White shine (#FFFFFF)
 */
export const ManaPotion: PxlKitData = {
  name: 'mana-potion',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......KK.......',
    '.......KK.......',
    '......KPPK......',
    '......PPPP......',
    '.....PPPWPP.....',
    '.....PPPPPP.....',
    '.....PPPPPP.....',
    '.....DPPPPD.....',
    '.....DPPPPD.....',
    '.....DPPWPD.....',
    '......DPPD......',
    '......DPPD......',
    '.......DD.......',
    '................',
    '................',
  ],
  palette: {
    K: '#654321',
    P: '#4060FF',
    L: '#A0B0FF',
    D: '#2030A0',
    W: '#FFFFFF',
  },
  tags: ['potion', 'mana', 'mp', 'blue', 'magic', 'consumable', 'rpg'],
  author: 'pxlkit',
};
