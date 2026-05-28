import type { PxlKitData } from '@pxlkit/core';

/**
 * 🛡️! ShieldExclamation — filled orange shield with a white ! (critical
 * security issue). Shares the shield silhouette of shield-check / -alert /
 * -cross; orange marks higher severity than the amber shield-alert.
 *
 *   S = Shield fill (#E8590C)
 *   D = Dark rim (#9A3412)
 *   C = White mark (#FFFFFF)
 */
export const ShieldExclamation: PxlKitData = {
  name: 'shield-exclamation',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '................',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSSSCCSSSS...',
    '...SSSSCCSSSS...',
    '...SSSSCCSSSS...',
    '...SSSSCCSSSS...',
    '....DSSSSSSD....',
    '....DSSCCSSD....',
    '.....DSSSSD.....',
    '......DSSD......',
    '.......DD.......',
    '................',
    '................',
  ],
  palette: {
    S: '#E8590C',
    D: '#9A3412',
    C: '#FFFFFF',
  },
  tags: ['shield', 'exclamation', 'warning', 'alert', 'critical', 'security', 'feedback'],
  author: 'pxlkit',
};
