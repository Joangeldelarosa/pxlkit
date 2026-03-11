import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💕 FloatingHearts — 16×16 animated floating hearts
 *
 * Red and pink hearts rising from the bottom of the frame — love, like.
 * 4 frames — hearts at different vertical offsets.
 *
 * Palette:
 *   R = Red heart   (#E74C3C)
 *   P = Pink heart  (#FF8FAB)
 *   D = Dark red    (#C0392B)
 */
export const FloatingHearts: AnimatedPxlKitData = {
  name: 'floating-hearts',
  size: 16,
  category: 'social',
  palette: {
    R: '#E74C3C',
    P: '#FF8FAB',
    D: '#C0392B',
  },
  frames: [
    {
      grid: [
        '................',
        '................',
        '................',
        '................',
        '................',
        '....PP..........', 
        '...PPPP.........', 
        '..PPPPPP........', 
        '...PPPP.........', 
        '....PP..........', 
        '..........RR....',
        '.........RRRR...',
        '........RRRRRR..',
        '.........RRRR...',
        '..........RR....',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '................',
        '....PP..........',
        '...PPPP.........',
        '..PPPPPP........',
        '...PPPP.........',
        '....PP..........',
        '................',
        '..........RR....',
        '.........RRRR...',
        '........RRRRRR..',
        '.........RRRR...',
        '..........RR....',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '....PP..........',
        '...PPPP.........',
        '..PPPPPP........',
        '...PPPP.........',
        '....PP..........',
        '................',
        '..........RR....',
        '.........RRRR...',
        '........RRRRRR..',
        '.........RRRR...',
        '..........RR....',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '....PP..........',
        '...PPPP.........',
        '..PPPPPP........',
        '...PPPP.........',
        '....PP..........',
        '................',
        '..........RR....',
        '.........RRRR...',
        '........RRRRRR..',
        '.........RRRR...',
        '..........RR....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 200,
  loop: true,
  trigger: 'loop',
  tags: ['hearts', 'love', 'like', 'float', 'animated', 'social'],
  author: 'pxlkit',
};
