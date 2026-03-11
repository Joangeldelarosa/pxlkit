import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💬 BouncingMessage — 16×16 animated bouncing speech bubble
 *
 * A speech bubble that bounces up and down with typing dots — chat, typing.
 * 3 frames — up / neutral / down, 250ms per frame.
 *
 * Palette:
 *   B = Blue bubble (#4A90D9)
 *   D = Dark blue   (#2E6DA4)
 *   W = White dots  (#FFFFFF)
 */
export const BouncingMessage: AnimatedPxlKitData = {
  name: 'bouncing-message',
  size: 16,
  category: 'social',
  palette: {
    B: '#4A90D9',
    D: '#2E6DA4',
    W: '#FFFFFF',
    T: '#3A7DC0',
  },
  frames: [
    {
      grid: [
        '................',
        '..BBBBBBBBBBBB..',
        '.BBBBBBBBBBBBBBB',
        '.BDDDBBBBBBDDDB.',
        '.BBBBBBBBBBBBB..',
        '.BBBWBBWBBWBBB..',
        '.BDDDBBBBBBDDDB.',
        '.BBBBBBBBBBBBBB.',
        '..BBBBBBBBBBBBB.',
        '...BBBBBBBBT....',
        '....BBBBBBT.....',
        '.....BBBBT......',
        '.......T........',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '..BBBBBBBBBBBB..',
        '.BBBBBBBBBBBBBBB',
        '.BDDDBBBBBBDDDB.',
        '.BBBBBBBBBBBBB..',
        '.BBBWBBWBBWBBB..',
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
    },
    {
      grid: [
        '................',
        '................',
        '................',
        '..BBBBBBBBBBBB..',
        '.BBBBBBBBBBBBBBB',
        '.BDDDBBBBBBDDDB.',
        '.BBBBBBBBBBBBB..',
        '.BBBWBBWBBWBBB..',
        '.BDDDBBBBBBDDDB.',
        '.BBBBBBBBBBBBBB.',
        '..BBBBBBBBBBBBB.',
        '...BBBBBBBBT....',
        '....BBBBBBT.....',
        '.....BBBBT......',
        '.......T........',
        '................',
      ],
    },
  ],
  frameDuration: 250,
  loop: true,
  trigger: 'loop',
  tags: ['message', 'chat', 'bounce', 'typing', 'animated', 'social'],
  author: 'pxlkit',
};
