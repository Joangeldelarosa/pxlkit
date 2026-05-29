import type { PxlKitData } from '@pxlkit/core';

/**
 * 📋 Copy — 16×16 pixel art copy to clipboard
 *
 * Two clearly-overlapping document pages: a darker back page peeking out
 * top-left, a white front page on top with three text lines. Reads as
 * "duplicate / copy" instead of a single document.
 *
 *   W = Front page (#FFFFFF)
 *   B = Back page  (#B0D4EE)
 *   O = Outline    (#334455)
 *   L = Text line  (#AABBCC)
 */
export const Copy: PxlKitData = {
  name: 'copy',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '..OOOOOOOO......',
    '..OBBBBBBO......',
    '..OBOOOOOOOOO...',
    '..OBOWWWWWWWO...',
    '..OBOWLLLLLWO...',
    '..OOOWWWWWWWO...',
    '....OWLLLLLWO...',
    '....OWWWWWWWO...',
    '....OWLLLLLWO...',
    '....OWWWWWWWO...',
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
