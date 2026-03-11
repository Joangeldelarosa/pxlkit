import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌙 ClearNight — 16×16 pixel art clear night sky
 *
 * A crescent moon with two bright stars — clear, calm night.
 *
 * Palette:
 *   M = Moon yellow (#F0C040)
 *   D = Dark edge   (#C89020)
 *   S = Star white  (#FFFFFF)
 *   N = Navy sky    (#1A2A4A)
 */
export const ClearNight: PxlKitData = {
  name: 'clear-night',
  size: 16,
  category: 'weather',
  grid: [
    '................',
    '......S.........',
    '.....MMM........',
    '....MMMMMM......',
    '...MMMMMMMM.....',
    '...MMMMMMMM.....',
    '...MMMMMMMM.....',
    '....MMMMMMM.....',
    '.....MMMMM......',
    '......MMM..S....',
    '.......M........',
    '................',
    '...S............',
    '................',
    '................',
    '................',
  ],
  palette: {
    M: '#F0C040',
    D: '#C89020',
    S: '#FFFFFF',
    N: '#1A2A4A',
  },
  tags: ['night', 'clear', 'moon', 'stars', 'calm', 'weather'],
  author: 'pxlkit',
};
