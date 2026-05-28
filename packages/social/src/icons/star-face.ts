import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌟 StarFace — 16×16 pixel art star-eyed face emoji
 *
 * Yellow face with star-shaped pupils and beaming smile — awestruck, fans.
 * Uses the same yellow face silhouette as `smile` so the face family stays
 * coherent; the eyes are 3×3 plus-shaped orange stars centered on cols 5 and 10
 * (mirror-symmetric about col 7.5).
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   S = Star orange (#FF9500)
 *   K = Mouth black (#1A1A1A)
 *   O = Outline     (#CC9900)
 */
export const StarFace: PxlKitData = {
  name: 'star-face',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....OOOOOO.....',
    '...OOYYYYYYOO...',
    '..OOYYYYYYYYOO..',
    '..OYYSYYYYSYYO..',
    '.OOYSSSYYSSSYOO.',
    '.OYYYSYYYYSYYYO.',
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
    S: '#FF9500',
    K: '#1A1A1A',
    O: '#CC9900',
  },
  tags: ['star', 'eyes', 'amazed', 'fan', 'starstruck', 'emoji', 'social'],
  author: 'pxlkit',
};
