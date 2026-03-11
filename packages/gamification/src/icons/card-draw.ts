import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 🃏 CardDraw — 16×16 animated pixel art
 *
 * A playing card that flips face-up — card games, gacha, card draw.
 * 4 frames: face down → tilting → edge → face up (suit revealed).
 */
export const CardDraw: AnimatedPxlKitData = {
  name: 'card-draw',
  size: 16,
  category: 'gamification',
  palette: {
    W: '#FFFFFF', // card face
    B: '#1A1A4E', // card back pattern
    D: '#000033', // outline
    R: '#DD2020', // diamond suit
    G: '#334455', // back dots
  },
  frames: [
    {
      // Face down card
      grid: [
        '................',
        '...DDDDDDDDD....',
        '..DBBBBBBBBBD...',
        '..DBGBGBGBGBD...',
        '..DBGBGBGBGBD...',
        '..DBBBBBBBBBD...',
        '..DBGBGBGBGBD...',
        '..DBGBGBGBGBD...',
        '..DBBBBBBBBBD...',
        '..DBGBGBGBGBD...',
        '..DBGBGBGBGBD...',
        '..DBBBBBBBBBD...',
        '...DDDDDDDDD....',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Tilting up (narrowing)
      grid: [
        '................',
        '....DDDDDDD.....',
        '...DBBBBBBD.....',
        '...DBGBGBGBD....',
        '...DBGBGBGBD....',
        '...DBBBBBBBD....',
        '...DBGBGBGBD....',
        '...DBGBGBGBD....',
        '...DBBBBBBBD....',
        '...DBGBGBGBD....',
        '...DBGBGBGBD....',
        '...DBBBBBBBD....',
        '....DDDDDDD.....',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Edge on (very thin)
      grid: [
        '................',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '.......DD.......',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Face up — diamond suit showing
      grid: [
        '................',
        '...DDDDDDDDD....',
        '..DWWWWWWWWWD...',
        '..DWRWWWWWRWD...',
        '..DWWRWWWRWWD...',
        '..DWWWRWRWWWD...',
        '..DWWWWRWWWWD...',
        '..DWWWRWRWWWD...',
        '..DWWRWWWRWWD...',
        '..DWRWWWWWRWD...',
        '..DWWWWWWWWWD...',
        '..DWWWWWWWWWD...',
        '...DDDDDDDDD....',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 120,
  loop: false,
  trigger: 'hover',
  tags: ['card', 'draw', 'flip', 'gacha', 'play', 'game'],
  author: 'pxlkit',
};
