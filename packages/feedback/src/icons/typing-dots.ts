import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💬… TypingDots — a filled chat bubble with a tail and three animated dots.
 * Filled (not outlined) so it reads on dark AND light; one dot lights up per
 * frame, then all dim (pause).
 *
 *   B = bubble fill (#475569)
 *   W = active dot  (#FFFFFF)
 *   G = dim dot     (#94A3B8)
 */
export const TypingDots: AnimatedPxlKitData = {
  name: 'typing-dots',
  size: 16,
  category: 'feedback',
  palette: {
    B: '#475569',
    W: '#FFFFFF',
    G: '#94A3B8',
  },
  frames: [
    {
      grid: [
        '................',
        '................',
        '...BBBBBBBBBB...',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBWWBGGBGGBB..',
        '..BBWWBGGBGGBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '...BBBBBBBBBB...',
        '...BBB..........',
        '..BB............',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '...BBBBBBBBBB...',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBGGBWWBGGBB..',
        '..BBGGBWWBGGBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '...BBBBBBBBBB...',
        '...BBB..........',
        '..BB............',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '...BBBBBBBBBB...',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBGGBGGBWWBB..',
        '..BBGGBGGBWWBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '...BBBBBBBBBB...',
        '...BBB..........',
        '..BB............',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '...BBBBBBBBBB...',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '..BBGGBGGBGGBB..',
        '..BBGGBGGBGGBB..',
        '..BBBBBBBBBBBB..',
        '..BBBBBBBBBBBB..',
        '...BBBBBBBBBB...',
        '...BBB..........',
        '..BB............',
        '................',
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
