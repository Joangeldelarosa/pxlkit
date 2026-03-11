import type { PxlKitData } from '@pxlkit/core';

/**
 * ⬇️ Download — 16×16 pixel art download arrow
 *
 * A downward arrow into a tray — download, save, import, fetch.
 *
 * Palette:
 *   B = Blue arrow (#5B9BD5)
 *   D = Dark tray  (#2E6DA4)
 *   O = Outline    (#334455)
 */
export const Download: PxlKitData = {
  name: 'download',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '....BBBBBBBB....',
    '.....BBBBBB.....',
    '......BBBB......',
    '.......BB.......',
    '................',
    '..OOOOOOOOOOOO..',
    '..ODDDDDDDDDDO..',
    '..ODDDDDDDDDDO..',
    '..OOOOOOOOOOOO..',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
    O: '#334455',
  },
  tags: ['download', 'save', 'import', 'fetch', 'ui'],
  author: 'pxlkit',
};
