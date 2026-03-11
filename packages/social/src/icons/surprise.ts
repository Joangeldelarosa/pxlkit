import type { PxlKitData } from '@pxlkit/core';

/**
 * 😲 Surprise — 16×16 pixel art surprised face emoji
 *
 * Yellow wide-eyed face with open O-shaped mouth — shocked, amazed.
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   K = Black       (#1A1A1A)
 *   O = Outline     (#CC9900)
 *   W = White eyes  (#FFFFFF)
 */
export const Surprise: PxlKitData = {
  name: 'surprise',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '......OOOO......',
    '....OOYYYYOO....',
    '...OOYYWWYYOO...',
    '..OOYYKYYKYYOO..',
    '..OYYYYYYYYYYO..',
    '..OYYYYKKYYYYO..',
    '..OYYYKWWKYYYO..',
    '..OYYYKWWKYYYO..',
    '..OYYYYKKYYYYO..',
    '..OOYYYYYYYYOO..',
    '...OOYYYYYYOO...',
    '.....OOOOOO.....',
    '................',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    K: '#1A1A1A',
    O: '#CC9900',
    W: '#FFFFFF',
  },
  tags: ['surprise', 'shocked', 'amazed', 'oh', 'emoji', 'face', 'social'],
  author: 'pxlkit',
};
