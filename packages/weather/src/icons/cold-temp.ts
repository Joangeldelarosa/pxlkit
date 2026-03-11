import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌡️❄️ ColdTemp — 16×16 pixel art low temperature thermometer
 *
 * A thermometer with a blue bulb and low mercury — cold, freeze, low temp.
 *
 * Palette:
 *   B = Blue fill  (#4FC3F7)
 *   C = Cyan cold  (#81D4FA)
 *   G = Glass      (#B0D4EE)
 *   D = Dark frame (#556677)
 *   W = White      (#FFFFFF)
 */
export const ColdTemp: PxlKitData = {
  name: 'cold-temp',
  size: 16,
  category: 'weather',
  grid: [
    '.....DGGGD......',
    '.....GWWWG......',
    '.....GWWWG......',
    '.....GWWWG......',
    '.....GWWWG..C...',
    '.....GWWWG.CCC..',
    '.....GBBWG.CCC..',
    '.....GBBWG..C...',
    '.....GBBWG......',
    '.....GBBWG......',
    '....DGBBBBDBBBBB',
    '...DGBBBBBBDBBBB',
    '...DGBBBBBBDBBBB',
    '....DGBBBBDBBBB.',
    '.....DDDDD......',
    '................',
  ],
  palette: {
    B: '#4FC3F7',
    C: '#81D4FA',
    G: '#B0D4EE',
    D: '#556677',
    W: '#FFFFFF',
  },
  tags: ['cold', 'freeze', 'temperature', 'thermometer', 'winter', 'weather'],
  author: 'pxlkit',
};
