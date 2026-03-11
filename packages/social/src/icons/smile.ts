import type { PxlKitData } from '@pxlkit/core';

/**
 * 😊 Smile — 16×16 pixel art happy smiley face
 *
 * Classic yellow circular face with U-shaped smile — happiness, like.
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   K = Black       (#1A1A1A)
 *   L = Light chin  (#FFE566)
 *   O = Outline     (#CC9900)
 */
export const Smile: PxlKitData = {
  name: 'smile',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....OOOOOO.....',
    '...OOYYYYYYOO...',
    '..OOYYYYYYYYOO..',
    '..OYYYKYYKYYYO..',
    '.OOYYYYYYYYYYOO.',
    '.OYYYYYYYYYYYYO.',
    '.OYYKYYYYYYKYYO.',
    '.OYYYKYYYYKYYYO.',
    '.OYYYYKKKKYYYYO.',
    '..OYYYYYYYYYYO..',
    '..OOYYYYYYYYOO..',
    '...OOOOOOOOOO...',
    '................',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    K: '#1A1A1A',
    L: '#FFE566',
    O: '#CC9900',
  },
  tags: ['smile', 'happy', 'emoji', 'face', 'joy', 'social'],
  author: 'pxlkit',
};
