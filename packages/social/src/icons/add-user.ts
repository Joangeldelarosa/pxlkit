import type { PxlKitData } from '@pxlkit/core';

/**
 * 👤➕ AddUser — 16×16 pixel art add user / follow
 *
 * A person silhouette with a green + sign — follow, add friend, invite.
 *
 * Palette:
 *   H = Head blue   (#5B9BD5)
 *   B = Body blue   (#4A7EBF)
 *   G = Green +     (#27AE60)
 *   W = White +     (#FFFFFF)
 */
export const AddUser: PxlKitData = {
  name: 'add-user',
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
    '..............G.',
    '...BBBBBBB......',
    '...BBBBBBB...GGG',
    '...BBBBBBB...GWG',
    '...BBBBBBB...GWG',
    '...BBBBBBB......',
    '...BBBBBBBBB....',
    '................',
  ],
  palette: {
    H: '#5B9BD5',
    B: '#4A7EBF',
    G: '#27AE60',
    W: '#FFFFFF',
  },
  tags: ['add-user', 'follow', 'friend', 'invite', 'join', 'social'],
  author: 'pxlkit',
};
