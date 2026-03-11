import type { PxlKitData } from '@pxlkit/core';

/**
 * 🌟 StarFace — 16×16 pixel art star-eyed face emoji
 *
 * Yellow face with star-shaped pupils and beaming smile — awestruck, fans.
 *
 * Palette:
 *   Y = Yellow      (#FFD700)
 *   S = Star orange (#FF9500)
 *   K = Black       (#1A1A1A)
 *   O = Outline     (#CC9900)
 *   W = White       (#FFFFFF)
 */
export const StarFace: PxlKitData = {
  name: 'star-face',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....O..O.......',
    '....OOYYOO......',
    '..OOYYYYYYOO....',
    '..OYYYSYYSYYO...',
    '.OOYYSSYSSYYOO..',
    '.OYSSSSYSSSSYO..',
    '.OYYSYSYYSYSYO..',
    '.OYYSSYSSYSSYO..',
    '.OYYYSYYSYYYO...',
    '..OYYYYYYYYYO...',
    '..OOYYKKKYYOO...',
    '...OOOOOOOOOO...',
    '......OO........',
    '................',
    '................',
  ],
  palette: {
    Y: '#FFD700',
    S: '#FF9500',
    K: '#1A1A1A',
    O: '#CC9900',
    W: '#FFFFFF',
  },
  tags: ['star', 'eyes', 'amazed', 'fan', 'starstruck', 'emoji', 'social'],
  author: 'pxlkit',
};
