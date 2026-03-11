import type { PxlKitData } from '@pxlkit/core';

/**
 * ❤️‍🩹 HealthPotion — 16×16 pixel art red health potion
 *
 * A rounded red glass bottle with a cork stopper and a plus sign label.
 *
 * Palette:
 *   K = Cork brown (#654321)
 *   R = Red liquid (#FF4040)
 *   L = Light shine (#FF9090)
 *   D = Dark glass (#B01010)
 *   W = White shine (#FFFFFF)
 */
export const HealthPotion: PxlKitData = {
  name: 'health-potion',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '........K.......',
    '.......KKK......',
    '......KKKKK.....',
    '......RRRRR.....',
    '.....RRWRRRR....',
    '.....RRRRRRRR...',
    '.....RRRRRRRR...',
    '.....DRRRRRRD...',
    '.....DRRWRRRD...',
    '......DRRRD.....',
    '......DRRRD.....',
    '.......DDD......',
    '................',
    '................',
    '................',
  ],
  palette: {
    K: '#654321',
    R: '#FF4040',
    L: '#FF9090',
    D: '#B01010',
    W: '#FFFFFF',
  },
  tags: ['potion', 'health', 'heal', 'hp', 'red', 'consumable', 'rpg'],
  author: 'pxlkit',
};
