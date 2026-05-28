import type { PxlKitData } from '@pxlkit/core';

/**
 * 🎲 Dice — a six-sided die showing the "3" face (three clean diagonal pips),
 * a dark rounded border and a bottom shadow edge. The face is a light grey
 * (not pure white) so the die still reads on a light background.
 *
 *   F = Light face (#E8E8F0)
 *   D = Dark border (#3A3A55)
 *   S = Bottom shadow (#9090A8)
 *   P = Pip (#1A1A2E)
 */
export const Dice: PxlKitData = {
  name: 'dice',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '...DDDDDDDDDD...',
    '..DFFFFFFFFFFD..',
    '..DFPPFFFFFFFD..',
    '..DFPPFFFFFFFD..',
    '..DFFFFFFFFFFD..',
    '..DFFFFPPFFFFD..',
    '..DFFFFPPFFFFD..',
    '..DFFFFFFFFFFD..',
    '..DFFFFFFFPPFD..',
    '..DFFFFFFFPPFD..',
    '..DFFFFFFFFFFD..',
    '..DSSSSSSSSSSD..',
    '...DDDDDDDDDD...',
    '................',
    '................',
  ],
  palette: {
    F: '#E8E8F0',
    D: '#3A3A55',
    S: '#9090A8',
    P: '#1A1A2E',
  },
  tags: ['dice', 'd6', 'random', 'chance', 'luck', 'rng', 'board-game'],
  author: 'pxlkit',
};
