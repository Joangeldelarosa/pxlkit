import type { PxlKitData } from '@pxlkit/core';

/**
 * 😂 Laugh — 16×16 pixel art laughing face emoji
 *
 * Yellow face with closed X eyes, wide mouth, and tear streaks — LOL.
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   K = Black       (#1A1A1A)
 *   O = Outline     (#CC9900)
 *   B = Blue tear   (#4FC3F7)
 *   W = White teeth (#FFFFFF)
 */
export const Laugh: PxlKitData = {
  name: 'laugh',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '......OOOO......',
    '....OOYYYYOO....',
    '...OOYYYYYYOO...',
    '..OOYKYYYYKYOO..',
    '..OYYKKYYKKYYO..',
    '.OOYYYYYYYYYYOO.',
    '.OYYKKWWWWKKYYO.',
    '.OYYKWWWWWWKYYO.',
    '.OYYKKWWWWKKYYO.',
    '..BYYKKKKKKYYB..',
    '...BOYYYYYYOB...',
    '....OOOOOOOO....',
    '................',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    K: '#1A1A1A',
    O: '#CC9900',
    B: '#4FC3F7',
    W: '#FFFFFF',
  },
  tags: ['laugh', 'lol', 'funny', 'haha', 'emoji', 'face', 'social'],
  author: 'pxlkit',
};
