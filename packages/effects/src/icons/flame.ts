import type { AnimatedPxlKitData } from '@pxlkit/core';

export const Flame: AnimatedPxlKitData = {
  name: 'flame',
  size: 16,
  category: 'effects',
  palette: {
    R: '#FF4500', // red
    O: '#FF8C00', // orange
    Y: '#FFD700', // yellow
    W: '#FFFFCC', // white-hot core
    D: '#CC3300', // dark red ember
  },
  frames: [
    {
      // Frame 1: Flame leans left
      grid: [
        '................',
        '................',
        '.......R........',
        '......RO........',
        '.....ROR........',
        '.....ROYR.......',
        '....ROYYR.......',
        '....ROYWOR......',
        '....ROYWOR......',
        '...RROYORR......',
        '...RROOYRR......',
        '...RRROORRR.....',
        '....RRDDRR......',
        '....RRDDDR......',
        '.....DDDD.......',
        '................',
      ],
    },
    {
      // Frame 2: Flame centered tall
      grid: [
        '................',
        '........R.......',
        '.......RO.......',
        '.......ROR......',
        '......ROYR......',
        '......ROYYR.....',
        '.....ROYWYR.....',
        '.....ROYWOR.....',
        '....RROYWRR.....',
        '....RROOORR.....',
        '....RRROORRR....',
        '.....RROORR.....',
        '.....RRDDRR.....',
        '......DDDD......',
        '......DDDD......',
        '................',
      ],
    },
    {
      // Frame 3: Flame leans right
      grid: [
        '................',
        '................',
        '........R.......',
        '........OR......',
        '.......ROR......',
        '.......ROYR.....',
        '......ROYYR.....',
        '......ROYWOR....',
        '......ROYWOR....',
        '.....RROYORR....',
        '.....RROOYRR....',
        '....RRROORRR....',
        '.....RRDDRR.....',
        '.....RDDDR......',
        '......DDDD......',
        '................',
      ],
    },
    {
      // Frame 4: Flame short flicker
      grid: [
        '................',
        '................',
        '................',
        '.......R........',
        '......ROR.......',
        '......ROYR......',
        '.....ROYYR......',
        '.....ROWYOR.....',
        '.....ROYWOR.....',
        '....RROYWRR.....',
        '....RRROORRR....',
        '....RRROORR.....',
        '.....RRDDRR.....',
        '.....RDDDR......',
        '......DDDD......',
        '................',
      ],
    },
  ],
  frameDuration: 100,
  loop: true,
  trigger: 'loop',
  tags: ['flame', 'fire', 'burn', 'campfire', 'animated', 'effect'],
  author: 'pxlkit',
};
