import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌕 FullMoon — 16×16 pixel art full moon
 *
 * A round glowing full moon with surface detail — monthly cycle, night.
 *
 * Palette:
 *   Y = Moon ivory (#FFFACC)
 *   L = Light face (#FFF080)
 *   G = Grey spot  (#CCCCAA)
 *   D = Dark spot  (#AAAAAA)
 *   O = Outline    (#C89020)
 */
export const FullMoon: PxlKitData = {
  name: 'full-moon',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '......OOOO......',
    '....OOYYYYYOO...',
    '...OYLYLYYYYYO..',
    '..OYYYLLLYYYYYO.',
    '..OYYYLYLYYYYYYO',
    '..OYYYYYGDYYYYYO',
    '..OYYYYYDDYYYYYO',
    '..OYYYYYYYYYYYY.',
    '...OYYYYYYYYYO..',
    '....OOYYYYYOO...',
    '......OOOO......',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFFACC',
    L: '#FFF080',
    G: '#CCCCAA',
    D: '#AAAAAA',
    O: '#C89020',
  },
  tags: ['moon', 'full', 'night', 'cycle', 'bright', 'weather'],
  author: 'pxlkit',
};
