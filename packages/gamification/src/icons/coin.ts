import type { PxlKitData } from '@pxlkit/core';

/**
 * 🪙 Coin — 16×16 pixel art coin icon
 *
 * A gold coin with a dollar symbol for currency/rewards.
 *
 * Palette:
 *   G = Gold (#FFD700)
 *   Y = Yellow (#FFF44F)
 *   D = Dark gold (#B8860B)
 *   S = Shadow (#8B6914)
 */
export const Coin: PxlKitData = {
  name: 'coin',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......GGGG......',
    '....GGYYYGGD....',
    '...GYYYYYYYGD...',
    '...GYYGYYGYYGD..',
    '..GYYGYYYYYYGD..',
    '..GYYGYYYYYYGD..',
    '..GYYGYYGGYGDD..',
    '..GYYYYYGYYGDD..',
    '..GYYYYYGYYGDD..',
    '..GYYGYYGYYG.D..',
    '...GYYYYYYYGD...',
    '...GGYYYYGGDD...',
    '....DDGGGGDD....',
    '.....DDDDD......',
    '................',
  ],
  palette: {
    'G': '#FFD700',
    'Y': '#FFF44F',
    'D': '#B8860B',

  },
  tags: ['coin', 'money', 'currency', 'gold', 'reward', 'payment'],
  author: 'pxlkit',
};
