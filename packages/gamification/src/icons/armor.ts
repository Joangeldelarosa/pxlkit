import type { PxlKitData } from '@pxlkit/core';

/**
 * 🛡️ Armor — a breastplate with a clear torso silhouette: shoulder pauldrons,
 * a chest that narrows to the waist, dark steel edges and a center shine. The
 * old one was a rounded box with horizontal lines that read as a crate.
 *
 *   S = Steel body (#8898A8)
 *   D = Dark edge (#5C6B7A)
 *   W = Shine (#FFFFFF)
 */
export const Armor: PxlKitData = {
  name: 'armor',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..SSS......SSS..',
    '.SSSSS....SSSSS.',
    '.SSSSSSSSSSSSSS.',
    '.SDSSSSSSSSSSDS.',
    '.SDSSSSWWSSSSDS.',
    '.SDSSSSSSSSSSDS.',
    '..SDSSSSSSSSDS..',
    '...SDSSSSSSDS...',
    '....SDSSSSDS....',
    '.....SSSSSS.....',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    S: '#8898A8',
    D: '#5C6B7A',
    W: '#FFFFFF',
  },
  tags: ['armor', 'breastplate', 'defense', 'chest', 'plate', 'rpg'],
  author: 'pxlkit',
};
