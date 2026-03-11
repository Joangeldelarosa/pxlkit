import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎲 Dice — 16×16 pixel art six-sided die
 *
 * A classic d6 dice showing a three pip face — chance, RNG, luck, games.
 *
 * Palette:
 *   W = White face (#FFFFFF)
 *   D = Dark edge  (#444466)
 *   S = Shadow     (#888899)
 *   P = Pip black  (#1A1A2E)
 */
export const Dice: PxlKitData = {
  name: 'dice',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '...DDDDDDDDD....',
    '..DWWWWWWWWSD...',
    '..DWWWWWWWWSD...',
    '..DWWPDWWWWSD...',
    '..DWWPWWWWWSD...',
    '..DWWWWWWWWSD...',
    '..DWWWWWPWWSD...',
    '..DWWWWWPWWSD...',
    '..DWWWWWWWWSD...',
    '..DWWPWWWWWSD...',
    '..DWWPDWWWWSD...',
    '..DWWWWWWWWSD...',
    '..DSSSSSSSSSSD..',
    '...DDDDDDDDD....',
    '................',
  ],
  palette: {
    W: '#FFFFFF',
    D: '#444466',
    S: '#888899',
    P: '#1A1A2E',
  },
  tags: ['dice', 'd6', 'random', 'chance', 'luck', 'rng', 'board-game'],
  author: 'pxlkit',
};
