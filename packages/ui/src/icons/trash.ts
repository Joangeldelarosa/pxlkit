import type { PxlKitData } from '@pxlkit/core';

/**
 * 🗑️ Trash — 16×16 pixel art trash can / delete
 *
 * A trash bin with lid — delete, remove, discard.
 *
 * Palette:
 *   G = Grey can  (#889099)
 *   D = Dark lid  (#556677)
 *   R = Red tint  (#CC4444)
 *   O = Outline   (#334455)
 */
export const Trash: PxlKitData = {
  name: 'trash',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '.....OOOOO......',
    '...OOOOOOOOO....',
    '.OOOOOOOOOOOOO..',
    '.ODDDDDDDDDDO...',
    '..OGGGGGGGGO....',
    '..OGRGRGRGO.....',
    '..OGRGRGRGO.....',
    '..OGRGRGRGO.....',
    '..OGRGRGRGO.....',
    '..OGRGRGRGO.....',
    '..OGGGGGGGGO....',
    '..OGGGGGGGO.....',
    '...OOOOOOO......',
    '................',
    '................',
  ],
  palette: {
    G: '#889099',
    D: '#556677',
    R: '#CC4444',
    O: '#334455',
  },
  tags: ['trash', 'delete', 'remove', 'bin', 'discard', 'ui'],
  author: 'pxlkit',
};
