import type { AnimatedPxlKitData } from '@pxlkit/core';

// ─── Sparkling Star (4 frames) ─────────────
// A golden star with white sparkle highlights that rotate around it.

export const SparkleStar: AnimatedPxlKitData = {
  name: 'sparkle-star',
  size: 16,
  category: 'gamification',
  palette: {
    Y: '#FFD700', // star gold
    D: '#DAA520', // star shadow
    W: '#FFFFFF', // sparkle
  },
  frames: [
    {
      grid: [
        '.......WY.......',
        '.......YY.......',
        '......YYYY......',
        '......YYYY......',
        'YYYYYYYYYYYYYY..',
        '.YYYYYYYYYYYY...',
        '..YYYYYYYYYY....',
        '...YYYYYYYY.....',
        '....YYYYYY......',
        '...YYYY.YYYY....',
        '...YYY...YYY....',
        '..YYY.....YYY...',
        '..YY.......YY...',
        '.YY.........YY..',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '.......YY.......',
        '.......YY..W....',
        '......YYYY......',
        '......YYYY......',
        'YYYYYYYYYYYYYY..',
        '.YYYYYYYYYYYY...',
        '..YYYYYYYYYY....',
        '...YYYYYYYY.....',
        '....YYYYYY......',
        '...YYYY.YYYY....',
        '...YYY...YYY....',
        '..YYY.....YYY...',
        '..YY.......YY...',
        '.YY.........YY..',
        '..W.............',
        '................',
      ],
    },
    {
      grid: [
        '.......YY.......',
        '.......YY.......',
        '......YYYY......',
        '......YYYY..W...',
        'YYYYYYYYYYYYYY..',
        '.YYYYYYYYYYYY...',
        '..YYYYYYYYYY....',
        '...YYYYYYYY.....',
        '....YYYYYY......',
        '...YYYY.YYYY....',
        '...YYY...YYY....',
        '..YYY.....YYY...',
        'W.YY.......YY...',
        '.YY.........YY..',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '.......YY.......',
        '.......YY.......',
        '......YYYY......',
        '......YYYY......',
        'YYYYYYYYYYYYYY..',
        '.YYYYYYYYYYW....',
        '..YYYYYYYYYY....',
        '...YYYYYYYY.....',
        '....YYYYYY......',
        '...YYYY.YYYY....',
        '...YYY...YYY....',
        '..YYY.....YYY...',
        '..YY.......YY...',
        '.YY.........YY..',
        '.........W......',
        '................',
      ],
    },
  ],
  frameDuration: 200,
  loop: true,
  trigger: 'loop',
  tags: ['star', 'sparkle', 'shine', 'magic', 'animated', 'effect'],
  author: 'pxlkit',
};
