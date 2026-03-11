import type { PxlKitData } from '@pxlkit/core';

/**
 * ⬆️ Upload — 16×16 pixel art upload arrow
 *
 * An upward arrow from a tray — upload, send, export, push.
 *
 * Palette:
 *   B = Blue arrow (#5B9BD5)
 *   D = Dark tray  (#2E6DA4)
 *   O = Outline    (#334455)
 */
export const Upload: PxlKitData = {
  name: 'upload',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '..OOOOOOOOOOOO..',
    '..ODDDDDDDDDDO..',
    '..ODDDDDDDDDDO..',
    '..OOOOOOOOOOOO..',
    '................',
    '.......BB.......',
    '......BBBB......',
    '.....BBBBBB.....',
    '....BBBBBBBB....',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '.......BB.......',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
    O: '#334455',
  },
  tags: ['upload', 'send', 'export', 'push', 'ui'],
  author: 'pxlkit',
};
