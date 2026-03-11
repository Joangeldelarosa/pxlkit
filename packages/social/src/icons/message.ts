import type { PxlKitData } from '@pxlkit/core';

/**
 * 💬 Message — 16×16 pixel art text message bubble
 *
 * A rounded speech bubble with three dots — text message / DM.
 *
 * Palette:
 *   B = Blue bubble  (#4A90D9)
 *   D = Dark blue    (#2E6DA4)
 *   W = White dots   (#FFFFFF)
 *   T = Tail blue    (#3A7BC8)
 */
export const Message: PxlKitData = {
  name: 'message',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '..BBBBBBBBBBBB..',
    '.BBBBBBBBBBBBBBB',
    '.BDDDBBBBBBDDDB.',
    '.BBBBBBBBBBBBB..',
    '.BBBWBBWBBWBBB..',
    '.BBBBBBBBBBBBB..',
    '.BDDDBBBBBBDDDB.',
    '.BBBBBBBBBBBBBB.',
    '..BBBBBBBBBBBBB.',
    '...BBBBBBBBT....',
    '....BBBBBBT.....',
    '.....BBBBT......',
    '.......T........',
    '................',
    '................',
  ],
  palette: {
    B: '#4A90D9',
    D: '#2E6DA4',
    W: '#FFFFFF',
    T: '#3A7BC8',
  },
  tags: ['message', 'chat', 'dm', 'text', 'bubble', 'social'],
  author: 'pxlkit',
};
