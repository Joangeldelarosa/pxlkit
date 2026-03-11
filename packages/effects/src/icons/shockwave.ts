import type { AnimatedPxlKitData } from '@pxlkit/core';

export const Shockwave: AnimatedPxlKitData = {
  name: 'shockwave',
  size: 16,
  category: 'effects',
  palette: {
    W: '#FFFFFF', // white core
    Y: '#FFD700', // yellow ring
    L: '#FFFFAA', // light yellow
    D: '#CCAA00', // dim yellow
  },
  frames: [
    {
      // Frame 1: Compressed wave band
      grid: [
        '................',
        '................',
        '................',
        '................',
        '................',
        '.....DDDDDD.....',
        '....DYYYYYYD....',
        '...DYW....WYD...',
        '...DYW....WYD...',
        '....DYYYYYYD....',
        '.....DDDDDD.....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Frame 2: Small ring expands
      grid: [
        '................',
        '................',
        '................',
        '................',
        '.....DYYYD......',
        '....DY...YD.....',
        '...DY.....YD....',
        '...DY..W..YD....',
        '...DY..W..YD....',
        '...DY.....YD....',
        '....DY...YD.....',
        '.....DYYYD......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Frame 3: Large ring
      grid: [
        '................',
        '................',
        '....DDDDDD......',
        '...DD....DD.....',
        '..DD......DD....',
        '..D..LYYL..D....',
        '.DD.LY..YL.DD...',
        '.DD.Y....Y.DD...',
        '.DD.Y....Y.DD...',
        '.DD.LY..YL.DD...',
        '..D..LYYL..D....',
        '..DD......DD....',
        '...DD....DD.....',
        '....DDDDDD......',
        '................',
        '................',
      ],
    },
    {
      // Frame 4: Fading outer ring
      grid: [
        '......DD........',
        '...DDD..DDD.....',
        '..DD......DD....',
        '.DD........DD...',
        '.D..........D...',
        'DD..........DD..',
        'D....DDDD....D..',
        'D...DD..DD...D..',
        'D...DD..DD...D..',
        'D....DDDD....D..',
        'DD..........DD..',
        '.D..........D...',
        '.DD........DD...',
        '..DD......DD....',
        '...DDD..DDD.....',
        '......DD........',
      ],
    },
  ],
  frameDuration: 80,
  loop: false,
  trigger: 'once',
  tags: ['shockwave', 'ring', 'wave', 'expand', 'animated', 'effect'],
  author: 'pxlkit',
};
