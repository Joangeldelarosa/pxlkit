import type { PxlKitData } from '@pxlkit/core';

/**
 * ⛑️ Helmet — 16×16 pixel art knight helmet
 *
 * A steel great-helm with narrow visor slits.
 *
 * Palette:
 *   S = Silver   (#B0B8C0)
 *   D = Dark     (#708090)
 *   H = Hi-light (#D0D8E8)
 *   V = Visor    (#1C2430)
 *   W = Shine    (#FFFFFF)
 */
export const Helmet: PxlKitData = {
  name: 'helmet',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '......SSSS......',
    '....SSSSSSSS....',
    '..SSDDDDDDDDSS..',
    '..SDHHHHHHHHDS..',
    '..SDHWWWWWWHDS..',
    '..SDDDDDDDDDDS..',
    '..SDVVVVVVVVDS..',
    '..SDVVVVVVVVDS..',
    '..SDDDDDDDDDDS..',
    '...SSDDDDDSS....',
    '....SSSSSSSS....',
    '......SSSS......',
    '................',
    '................',
    '................',
  ],
  palette: {
    S: '#B0B8C0',
    D: '#708090',
    H: '#D0D8E8',
    V: '#1C2430',
    W: '#FFFFFF',
  },
  tags: ['helmet', 'helm', 'knight', 'defense', 'head', 'rpg'],
  author: 'pxlkit',
};
