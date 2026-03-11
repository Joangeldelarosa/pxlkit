import type { PxlKitData } from '@pxlkit/core';

/**
 * 👤➖ RemoveUser — 16×16 pixel art remove user / unfollow
 *
 * A person silhouette with a red − sign — unfollow, remove friend.
 *
 * Palette:
 *   H = Head blue   (#5B9BD5)
 *   B = Body blue   (#4A7EBF)
 *   R = Red −       (#E74C3C)
 *   W = White bar   (#FFFFFF)
 */
export const RemoveUser: PxlKitData = {
  name: 'remove-user',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....HHH........',
    '....HHHHH.......',
    '.....HHH........',
    '....BBBBB.......',
    '...BBBBBBB......',
    '....BBBBB.......',
    '....BBBBB.......',
    '...BBBBBBB......',
    '...BBBBBBB...RRR',
    '...BBBBBBB...RWR',
    '...BBBBBBB...RRR',
    '...BBBBBBB......',
    '...BBBBBBBBB....',
    '................',
    '................',
  ],
  palette: {
    H: '#5B9BD5',
    B: '#4A7EBF',
    R: '#E74C3C',
    W: '#FFFFFF',
  },
  tags: ['remove-user', 'unfollow', 'unfriend', 'leave', 'social'],
  author: 'pxlkit',
};
