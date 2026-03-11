import type { AnimatedPxlKitData } from '@pxlkit/core';

// ─── Pulse Heart (4 frames) ────────────────
// A red heart that beats — grows and shrinks cyclically.

export const PulseHeart: AnimatedPxlKitData = {
  name: 'pulse-heart',
  size: 16,
  category: 'social',
  palette: {
    R: '#FF4D6A', // heart
    D: '#CC2244', // shadow
    W: '#FFB3C1', // highlight
  },
  frames: [
    {
      // Normal size
      grid: [
        '................',
        '................',
        '................',
        '..WRR....RRR....',
        '..RRRR..RRRRR...',
        '..RRRRRRRRRRR...',
        '..RRRRRRRRRRR...',
        '...RRRRRRRRR....',
        '....RRRRRRR.....',
        '.....RRRRR......',
        '......RRR.......',
        '.......R........',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Expanded (beat peak)
      grid: [
        '................',
        '................',
        '.WWRR....RRRR...',
        '.RRRRR..RRRRRD..',
        '.RRRRRRRRRRRRD..',
        '.RRRRRRRRRRRRD..',
        '.RRRRRRRRRRRRD..',
        '..RRRRRRRRRRR...',
        '...RRRRRRRRR....',
        '....RRRRRRR.....',
        '.....RRRRR......',
        '......RRR.......',
        '.......R........',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Normal size
      grid: [
        '................',
        '................',
        '................',
        '..WRR....RRR....',
        '..RRRR..RRRRR...',
        '..RRRRRRRRRRR...',
        '..RRRRRRRRRRR...',
        '...RRRRRRRRR....',
        '....RRRRRRR.....',
        '.....RRRRR......',
        '......RRR.......',
        '.......R........',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Slightly smaller (between beats)
      grid: [
        '................',
        '................',
        '................',
        '................',
        '...WRR..RRR.....',
        '...RRRRRRRRD....',
        '...RRRRRRRRD....',
        '....RRRRRRD.....',
        '.....RRRRR......',
        '......RRR.......',
        '.......R........',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 180,
  loop: true,
  trigger: 'loop',
  tags: ['heart', 'pulse', 'beat', 'love', 'animated', 'health'],
  author: 'pxlkit',
};
