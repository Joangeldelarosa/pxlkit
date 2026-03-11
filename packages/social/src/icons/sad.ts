import type { PxlKitData } from '@pxlkit/core';

/**
 * 😢 Sad — 16×16 pixel art sad face emoji
 *
 * Yellow circular face with inverted frown and blue teardrop — sadness.
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   K = Black       (#1A1A1A)
 *   O = Outline     (#CC9900)
 *   B = Blue tear   (#4FC3F7)
 */
export const Sad: PxlKitData = {
  name: 'sad',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....OOOOOO.....',
    '...OOYYYYYYOO...',
    '..OYYYYYYYYYYO..',
    '.OYYYYKYYKYYYYO.',
    '.OYYYYKYYKYYYYO.',
    '.OYYYYYYYYYYYYO.',
    '.OYYYYYYYYYYYYO.',
    '.OYYYKYYYYYKYYO.',
    '.OYYYYKKKKYYYYO.',
    '..OYYYKYYKYYYO..',
    '..OOYYYYYYYYO.B.',
    '...OOYYYYYYOO.B.',
    '.....OOOOOO.....',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    K: '#1A1A1A',
    O: '#CC9900',
    B: '#4FC3F7',
  },
  tags: ['sad', 'cry', 'unhappy', 'emoji', 'face', 'social'],
  author: 'pxlkit',
};
