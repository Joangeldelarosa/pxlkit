import type { AnimatedPxlKitData } from '@pxlkit/core';

export const TypingDots: AnimatedPxlKitData = {
  name: 'typing-dots',
  size: 16,
  category: 'feedback',
  palette: {
    B: '#64748B', // bubble
    D: '#475569', // bubble dark
    T: '#94A3B8', // tail
    W: '#FFFFFF', // dot active
    G: '#CBD5E1', // dot dim
    A: '#E2E8F0', // dot bright
  },
  frames: [
    {
      // Dot 1 active
      grid: [
        '................',
        '................',
        '................',
        '..BBBBBBBBBB....',
        '..BDDDDDDDDDBB..',
        '..BD.........DB.',
        '..BD.A..G..G.DB.',
        '..BD.W..G..G.DB.',
        '..BD.A..G..G.DB.',
        '..BD.........DB.',
        '..BDDDDDDDDDBB..',
        '..BBBBBBBBBB....',
        '....TT..........',
        '.....T..........',
        '................',
        '................',
      ],
    },
    {
      // Dot 2 active
      grid: [
        '................',
        '................',
        '................',
        '..BBBBBBBBBB....',
        '..BDDDDDDDDDBB..',
        '..BD.........DB.',
        '..BD.G..A..G.DB.',
        '..BD.G..W..G.DB.',
        '..BD.G..A..G.DB.',
        '..BD.........DB.',
        '..BDDDDDDDDDBB..',
        '..BBBBBBBBBB....',
        '....TT..........',
        '.....T..........',
        '................',
        '................',
      ],
    },
    {
      // Dot 3 active
      grid: [
        '................',
        '................',
        '................',
        '..BBBBBBBBBB....',
        '..BDDDDDDDDDBB..',
        '..BD.........DB.',
        '..BD.G..G..A.DB.',
        '..BD.G..G..W.DB.',
        '..BD.G..G..A.DB.',
        '..BD.........DB.',
        '..BDDDDDDDDDBB..',
        '..BBBBBBBBBB....',
        '....TT..........',
        '.....T..........',
        '................',
        '................',
      ],
    },
    {
      // All dim (pause)
      grid: [
        '................',
        '................',
        '................',
        '..BBBBBBBBBB....',
        '..BDDDDDDDDDBB..',
        '..BD.........DB.',
        '..BD.G..G..G.DB.',
        '..BD.G..G..G.DB.',
        '..BD.G..G..G.DB.',
        '..BD.........DB.',
        '..BDDDDDDDDDBB..',
        '..BBBBBBBBBB....',
        '....TT..........',
        '.....T..........',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 250,
  loop: true,
  trigger: 'loop',
  tags: ['typing', 'dots', 'chat', 'message', 'animated', 'ui'],
  author: 'pxlkit',
};
