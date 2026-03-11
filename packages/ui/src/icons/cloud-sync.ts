import type { PxlKitData } from '@pxlkit/core';

/**
 * ☁️🔄 CloudSync — 16×16 pixel art cloud sync icon
 *
 * A cloud with a circular sync arrow — cloud storage, sync, backup.
 *
 * Palette:
 *   C = Cloud blue (#B0D4EE)
 *   L = Light      (#D0EEFF)
 *   O = Outline    (#334455)
 *   A = Arrow blue (#5B9BD5)
 */
export const CloudSync: PxlKitData = {
  name: 'cloud-sync',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '....OOOO........',
    '...OCCCCO.......',
    '..OCCLCCCO......',
    '.OCCCCCCCCOOO...',
    '.OCCCCCCCCCCO...',
    '.OCCCCCCCCCCO...',
    '..OOOOOOOOOO....',
    '................',
    '....OAAAAO......',
    '...OAO..AAO.....',
    '..OAO.AA.OAO....',
    '..OAO....OAO....',
    '...OAA..OAO.....',
    '....OAAAAO......',
    '................',
  ],
  palette: {
    C: '#B0D4EE',
    L: '#D0EEFF',
    O: '#334455',
    A: '#5B9BD5',
  },
  tags: ['cloud', 'sync', 'backup', 'storage', 'upload', 'ui'],
  author: 'pxlkit',
};
