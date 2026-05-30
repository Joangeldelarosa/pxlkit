import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌙 CrescentMoon — 16×16 pixel art crescent moon
 *
 * Classic waxing crescent moon: the horns open to the right, with a darker
 * edge on the outside (gives volume) and a softer highlight on the inner
 * curve. The previous design rendered as a full disc which did not match
 * the icon name at 16 px.
 *
 *   Y = Moon gold  (#F0C040)
 *   D = Dark edge  (#C89020)
 *   L = Light glow (#F8E080)
 */
export const CrescentMoon: PxlKitData = {
  name: 'crescent-moon',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '.....DDDD.......',
    '...DDYYYYDD.....',
    '..DYYYYYYYYD....',
    '..DYY....YYD....',
    '.DYYY......D....',
    '.DYYL...........',
    '.DYYL...........',
    '.DYYL...........',
    '.DYYL...........',
    '.DYYY......D....',
    '..DYY....YYD....',
    '..DYYYYYYYYD....',
    '...DDYYYYDD.....',
    '.....DDDD.......',
    '................',
  ],
  palette: {
    Y: '#F0C040',
    D: '#C89020',
    L: '#F8E080',
  },
  tags: ['moon', 'crescent', 'night', 'sleep', 'nocturnal', 'weather'],
  author: 'pxlkit',
};
