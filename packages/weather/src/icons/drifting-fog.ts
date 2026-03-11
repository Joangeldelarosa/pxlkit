import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 🌫️ DriftingFog — 16×16 animated drifting fog
 *
 * Horizontal fog layers that slowly slide right — mist, haze, low visibility.
 * 4 frames — stripe offset shifting, 350ms per frame.
 *
 * Palette:
 *   F = Fog grey (#C4CDD6)  L = Light mist (#DDE6EE)
 */
export const DriftingFog: AnimatedPxlKitData = {
  name: 'drifting-fog',
  size: 16,
  category: 'weather',
  palette: {
    F: '#C4CDD6',
    L: '#DDE6EE',
  },
  frames: [
    {
      grid: [
        '................',
        '................',
        '.LLLLLLLLLLLLL..',
        'FFFFFFFFFFFFFFF.',
        'FFFFFFFFFFFFFFF.',
        '.LLLLLLLLLLLLL..',
        '................',
        '.LLLLLLLLLLLLL..',
        'FFFFFFFFFFFFFFF.',
        'FFFFFFFFFFFFFFF.',
        '.LLLLLLLLLLLLL..',
        '................',
        '.LLLLLLLLLLLLL..',
        'FFFFFFFFFFFFFFF.',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '..LLLLLLLLLLLLL.',
        '.FFFFFFFFFFFFFFF',
        '.FFFFFFFFFFFFFFF',
        '..LLLLLLLLLLLLL.',
        '................',
        '..LLLLLLLLLLLLL.',
        '.FFFFFFFFFFFFFFF',
        '.FFFFFFFFFFFFFFF',
        '..LLLLLLLLLLLLL.',
        '................',
        '..LLLLLLLLLLLLL.',
        '.FFFFFFFFFFFFFFF',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        'LLLLLLLLLLLLL...',
        'FFFFFFFFFFFFFF..',
        'FFFFFFFFFFFFFF..',
        'LLLLLLLLLLLLL...',
        '................',
        'LLLLLLLLLLLLL...',
        'FFFFFFFFFFFFFF..',
        'FFFFFFFFFFFFFF..',
        'LLLLLLLLLLLLL...',
        '................',
        'LLLLLLLLLLLLL...',
        'FFFFFFFFFFFFFF..',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '...LLLLLLLLLLLLL',
        '..FFFFFFFFFFFFFF',
        '..FFFFFFFFFFFFFF',
        '...LLLLLLLLLLLLL',
        '................',
        '...LLLLLLLLLLLLL',
        '..FFFFFFFFFFFFFF',
        '..FFFFFFFFFFFFFF',
        '...LLLLLLLLLLLLL',
        '................',
        '...LLLLLLLLLLLLL',
        '..FFFFFFFFFFFFFF',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 350,
  loop: true,
  trigger: 'loop',
  tags: ['fog', 'mist', 'haze', 'drift', 'animated', 'weather'],
  author: 'pxlkit',
};
