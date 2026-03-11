import type { PxlKitData } from '@pxlkit/core';

/**
 *  Wink  16x16 pixel art winking face emoji
 *
 * Yellow face with an asymmetric playful expression and a small tear sparkle.
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   K = Black       (#1A1A1A)
 *   O = Outline     (#CC9900)
 *   B = Blue tear   (#4AA3FF)
 */
export const Wink: PxlKitData = {
  name: 'wink',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....OOOOOO.....',
    '...OOYYYYYYOO...',
    '..OOYYYYYYYYOO..',
    '..OYYYKYYYYYYO..',
    '.OOYYKKKYYKYYOO.',
    '.OYYYYYYYYYYYYO.',
    '.OYYYYYYYYYYYOO.',
    '.OYYKYYYYYYYYYO.',
    '.OYYYYKKKKKYYYO.',
    '..OYYYYYYYYYYO..',
    '...OOYYYYYYOO...',
    '.....OOOOOO.....',
    '...........B....',
    '..........BB....',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    K: '#1A1A1A',
    O: '#CC9900',
    B: '#4AA3FF',
  },
  tags: ['wink', 'flirt', 'playful', 'emoji', 'face', 'social'],
  author: 'pxlkit',
};
