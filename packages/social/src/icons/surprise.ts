import type { PxlKitData } from '@pxlkit/core';

/**
 * 😲 Surprise — 16×16 pixel art surprised face emoji
 *
 * Yellow wide-eyed face with open O-shaped mouth — shocked, amazed. Reuses
 * the `smile` face silhouette for family coherence; eyes are 2×2 black
 * (cols 5–6 and 9–10) and the mouth is a clean 3-row K ring.
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   K = Black       (#1A1A1A)
 *   O = Outline     (#CC9900)
 */
export const Surprise: PxlKitData = {
  name: 'surprise',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....OOOOOO.....',
    '...OOYYYYYYOO...',
    '..OOYYYYYYYYOO..',
    '..OYYKKYYKKYYO..',
    '.OOYYKKYYKKYYOO.',
    '.OYYYYYYYYYYYYO.',
    '.OYYYYKKKKYYYYO.',
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
    O: '#CC9900',
  },
  tags: ['surprise', 'shocked', 'amazed', 'oh', 'emoji', 'face', 'social'],
  author: 'pxlkit',
};
