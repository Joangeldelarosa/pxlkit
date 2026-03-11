import type { PxlKitData } from '@pxlkit/core';

/**
 * ✕ Close — 16×16 pixel art close/X icon
 *
 * An X mark for close/dismiss actions.
 */
export const Close: PxlKitData = {
  name: 'close',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '..GG........GG..',
    '...GG......GG...',
    '....GG....GG....',
    '.....GG..GG.....',
    '......GGGG......',
    '.......GG.......',
    '......GGGG......',
    '.....GG..GG.....',
    '....GG....GG....',
    '...GG......GG...',
    '..GG........GG..',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#AAAAAA',
  },
  tags: ['close', 'dismiss', 'cancel', 'remove', 'x'],
};
