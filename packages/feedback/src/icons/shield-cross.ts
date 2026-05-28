import type { PxlKitData } from '@pxlkit/core';

/**
 * 🛡️✕ ShieldCross — filled red shield with a white ✕ (access denied / blocked /
 * failed protection). Shares the shield silhouette of shield-check / -alert /
 * -exclamation.
 *
 *   S = Shield fill (#E03131)
 *   D = Dark rim (#9B1C1C)
 *   C = White mark (#FFFFFF)
 */
export const ShieldCross: PxlKitData = {
  name: 'shield-cross',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '................',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSCSSSSCSS...',
    '...SSSCSSCSSS...',
    '...SSSSCCSSSS...',
    '...SSSSCCSSSS...',
    '....DSCSSCSD....',
    '....DCSSSSCD....',
    '.....DSSSSD.....',
    '......DSSD......',
    '.......DD.......',
    '................',
    '................',
  ],
  palette: {
    S: '#E03131',
    D: '#9B1C1C',
    C: '#FFFFFF',
  },
  tags: ['shield', 'cross', 'block', 'deny', 'fail', 'security', 'feedback'],
  author: 'pxlkit',
};
