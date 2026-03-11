import type { PxlKitData } from '@pxlkit/core';

/**
 * 👑 Crown — 16×16 pixel art crown icon
 *
 * A royal golden crown for rankings and VIP status.
 *
 * Palette:
 *   G = Gold (#FFD700)
 *   Y = Yellow (#FFF44F)
 *   D = Dark gold (#B8860B)
 *   R = Ruby red (#FF0000)
 *   B = Blue gem (#4169E1)
 */
export const Crown: PxlKitData = {
  name: 'crown',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '................',
    '.G....G....G....',
    '.GG..GYG..GG....',
    '.GYG.GYG.GYG....',
    '.GYGGGYGGGGYG...',
    '.GYYYYYYYYYYY...',
    '.GYYYYRYYBYYD...',
    '.GYYYYYYYYYYY...',
    '.GDDDDDDDDDDD...',
    '..GYYYYYYYYYD...',
    '..GDDDDDDDDDG...',
    '................',
    '................',
    '................',
    '................',
  ],
  palette: {
    'G': '#FFD700',
    'Y': '#FFF44F',
    'D': '#B8860B',
    'R': '#FF0000',
    'B': '#4169E1',
  },
  tags: ['crown', 'king', 'royal', 'vip', 'rank', 'premium'],
  author: 'pxlkit',
};
