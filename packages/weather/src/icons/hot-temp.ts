import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌡️🔥 HotTemp — 16×16 pixel art high temperature thermometer
 *
 * A thermometer with a red bulb and rising mercury — hot, heat, high temp.
 *
 * Palette:
 *   R = Red fill   (#E74C3C)
 *   O = Orange hot (#FF8C42)
 *   G = Glass      (#B0D4EE)
 *   D = Dark frame (#556677)
 *   W = White      (#FFFFFF)
 */
export const HotTemp: PxlKitData = {
  name: 'hot-temp',
  size: 16,
  category: 'weather',
  grid: [
    '.....DGGGD......',
    '.....GWWWG......',
    '.....GRRWG......',
    '.....GRRWG......',
    '.....GRRWG..OOO.',
    '.....GRRWG.OOOOO',
    '.....GRRWG.OOOOO',
    '.....GRRWG..OOO.',
    '.....GRRWG......',
    '.....GRRWG......',
    '....DGRRRRD.....',
    '...DGRRRRRRD....',
    '...DGRRRRRRD....',
    '....DGRRRRD.....',
    '.....DDDDD......',
    '................',
  ],
  palette: {
    R: '#E74C3C',
    O: '#FF8C42',
    G: '#B0D4EE',
    D: '#556677',
    W: '#FFFFFF',
  },
  tags: ['hot', 'heat', 'temperature', 'thermometer', 'warm', 'weather'],
  author: 'pxlkit',
};
