import type { PxlKitData } from '@pxlkit/core';

/**
 * ❤️‍🩹 HealthPotion — a rounded red bottle with a cork and a white "+" health
 * cross on the body (the old one promised a plus label but never drew it, so it
 * was just a generic red blob).
 *
 *   K = Cork brown (#654321)
 *   R = Red liquid (#FF4040)
 *   D = Dark glass (#B01010)
 *   W = White cross / shine (#FFFFFF)
 */
export const HealthPotion: PxlKitData = {
  name: 'health-potion',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '.......KK.......',
    '.......KK.......',
    '......DRRD......',
    '.....DRRRRD.....',
    '....DRRRRRRD....',
    '....RRRWWRRR....',
    '....RWWWWWWR....',
    '....RWWWWWWR....',
    '....RRRWWRRR....',
    '....DRRRRRRD....',
    '.....DRRRRD.....',
    '......DRRD......',
    '................',
    '................',
    '................',
  ],
  palette: {
    K: '#654321',
    R: '#FF4040',
    D: '#B01010',
    W: '#FFFFFF',
  },
  tags: ['potion', 'health', 'heal', 'hp', 'red', 'consumable', 'rpg'],
  author: 'pxlkit',
};
