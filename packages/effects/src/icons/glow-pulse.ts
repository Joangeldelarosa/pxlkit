import type { AnimatedPxlKitData } from '@pxlkit/core';

export const GlowPulse: AnimatedPxlKitData = {
  name: 'glow-pulse',
  size: 16,
  category: 'effects',
  palette: {
    B: '#0066FF', // blue core
    C: '#00CCFF', // cyan ring
    L: '#66DDFF', // light glow
    D: '#003388', // dim blue
    W: '#AAEEFF', // bright highlight
  },
  frames: [
    {
      // Frame 1: Small core
      grid: [
        '................',
        '................',
        '................',
        '................',
        '................',
        '......BBBB......',
        '.....BBCCBB.....',
        '.....BCWWCB.....',
        '.....BCWWCB.....',
        '.....BBCCBB.....',
        '......BBBB......',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Frame 2: Medium glow
      grid: [
        '................',
        '................',
        '................',
        '.....DDDD.......',
        '....DBBBBBD.....',
        '...DBBCCBBD.....',
        '...DBCWWCBD.....',
        '...DBCWWCBD.....',
        '...DBCWWCBD.....',
        '...DBBCCBBD.....',
        '....DBBBBBD.....',
        '.....DDDD.......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Frame 3: Full glow expanded
      grid: [
        '................',
        '................',
        '.....LLLLLL.....',
        '....LLDDDDLL....',
        '...LLDBBBBBDLL..',
        '..LLDBCCCCBDLL..',
        '..LDBBCWWCBBDL..',
        '..LDBCCWWCCBDL..',
        '..LDBCCWWCCBDL..',
        '..LDBBCWWCBBDL..',
        '..LLDBCCCCBDLL..',
        '...LLDBBBBBDLL..',
        '....LLDDDDLL....',
        '.....LLLLLL.....',
        '................',
        '................',
      ],
    },
    {
      // Frame 4: Contracting back
      grid: [
        '................',
        '................',
        '................',
        '....DDDDDDD.....',
        '...DDBBBBBDD....',
        '...DBBCCCCBD....',
        '...DBCCWWCBD....',
        '...DBCWWWCBD....',
        '...DBCWWWCBD....',
        '...DBCCWWCBD....',
        '...DBBCCCCBD....',
        '...DDBBBBBDD....',
        '....DDDDDDD.....',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 200,
  loop: true,
  trigger: 'loop',
  tags: ['glow', 'pulse', 'orb', 'aura', 'animated', 'effect'],
  author: 'pxlkit',
};
