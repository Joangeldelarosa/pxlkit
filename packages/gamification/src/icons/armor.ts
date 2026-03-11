import type { PxlKitData } from '@pxlkit/core';

/**
 * 🛡️ Armor — 16×16 pixel art chest armor (breastplate)
 *
 * A metal breastplate with pauldron shoulder guard and center clasp.
 *
 * Palette:
 *   S = Silver light (#A0B0C0)
 *   D = Dark steel  (#708090)
 *   V = Steel body  (#8898A8)
 *   H = Highlight   (#C8D8E8)
 *   W = White shine (#FFFFFF)
 */
export const Armor: PxlKitData = {
  name: 'armor',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '....SSSSSSSS....',
    '..SSDDDDDDDDSS..',
    '..SDVVVVVVVVDS..',
    '..SDVHHHHHHHDS..',
    '..SDVHWWWWHVDS..',
    '..SDVHHHHHHHDS..',
    '..SDVV....VVDS..',
    '..SDVHHHHHHHDS..',
    '..SDVHHHHHHHDS..',
    '..SSDDDDDDDDSS..',
    '....SSSSSSSS....',
    '......SSSS......',
    '................',
    '................',
    '................',
  ],
  palette: {
    S: '#A0B0C0',
    D: '#708090',
    V: '#8898A8',
    H: '#C8D8E8',
    W: '#FFFFFF',
  },
  tags: ['armor', 'breastplate', 'defense', 'chest', 'plate', 'rpg'],
  author: 'pxlkit',
};
