import type { PxlKitData } from '@pxlkit/core';

/**
 * 📋 Copy — 16×16 pixel art copy to clipboard
 *
 * Two overlapping document pages — copy, duplicate, clipboard.
 *
 * Palette:
 *   W = White page (#FFFFFF)
 *   B = Blue page  (#B0D4EE)
 *   O = Outline    (#334455)
 *   L = Lines      (#778899)
 */
export const Copy: PxlKitData = {
  name: 'copy',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '....OOOOOOO.....',
    '....OWWWWWOO....',
    '....OWLLLLWOO...',
    '....OWWWWWWWOO..',
    '....OWLLLLLLWOO.',
    '....OWWWWWWWWOO.',
    '....OWLLLLLLWO..',
    '....OWWWWWWWWO..',
    '....OWLLLLLLWO..',
    '....OWWWWWWWWO..',
    '....OOOOOOOOO...',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    W: '#FFFFFF',
    B: '#B0D4EE',
    O: '#334455',
    L: '#AABBCC',
  },
  tags: ['copy', 'clipboard', 'duplicate', 'paste', 'ui'],
  author: 'pxlkit',
};
