import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 🔔 ShakingBell — 16×16 animated shaking notification bell
 *
 * A bell that shakes left-right — new notification, alert, ring.
 * 4 frames — center / left / center / right, 150ms per frame.
 *
 * Palette:
 *   Y = Bell gold  (#FFB400)  D = Dark edge (#CC8800)  R = Red badge (#E74C3C)
 */
export const ShakingBell: AnimatedPxlKitData = {
  name: 'shaking-bell',
  size: 16,
  category: 'ui',
  palette: {
    Y: '#FFB400',
    D: '#CC8800',
    R: '#E74C3C',
  },
  frames: [
    {
      grid: [
        '................',
        '.......YY.......',
        '......YYYY......',
        '.....YYYYYY.....',
        '....YYYYYYYY....',
        '....YYYYYYYY.RR.',
        '....YYYYYYYY.RR.',
        '....YYYYYYYYYY..',
        '....YYYYYYYYYY..',
        '....DDDDDDDDDD..',
        '.....YYYYYYYY...',
        '......YYYY......',
        '.......YY.......',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '......YY........',
        '.....YYYY.......',
        '....YYYYYY......',
        '...YYYYYYYY.....',
        '...YYYYYYYY.RR..',
        '...YYYYYYYY.RR..',
        '...YYYYYYYYYY...',
        '...YYYYYYYYYY...',
        '...DDDDDDDDDD...',
        '....YYYYYYYY....',
        '.....YYYY.......',
        '......YY........',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '.......YY.......',
        '......YYYY......',
        '.....YYYYYY.....',
        '....YYYYYYYY....',
        '....YYYYYYYY.RR.',
        '....YYYYYYYY.RR.',
        '....YYYYYYYYYY..',
        '....YYYYYYYYYY..',
        '....DDDDDDDDDD..',
        '.....YYYYYYYY...',
        '......YYYY......',
        '.......YY.......',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '........YY......',
        '.......YYYY.....',
        '......YYYYYY....',
        '.....YYYYYYYY...',
        '.....YYYYYYYY.RR',
        '.....YYYYYYYY.RR',
        '.....YYYYYYYYYY.',
        '.....YYYYYYYYYY.',
        '.....DDDDDDDDDD.',
        '......YYYYYYYY..',
        '.......YYYY.....',
        '........YY......',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 150,
  loop: true,
  trigger: 'hover',
  tags: ['bell', 'notification', 'alert', 'ring', 'shake', 'animated', 'ui'],
  author: 'pxlkit',
};
