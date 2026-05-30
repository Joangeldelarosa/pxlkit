import type { PxlKitData } from '@pxlkit/core';

/**
 * ⋮ DotsMenu — 16×16 pixel art vertical three-dot menu
 *
 * Three vertical round dots (kebab menu) — overflow menu, more options.
 * Each dot is a 4×4 rounded square at cols 6–9, stacked at rows 1–4,
 * 6–9 and 11–14 so the silhouette reads clean at 16 px.
 *
 *   D = Dot grey (#667788)
 */
export const DotsMenu: PxlKitData = {
  name: 'dots-menu',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '.......DD.......',
    '......DDDD......',
    '......DDDD......',
    '.......DD.......',
    '................',
    '.......DD.......',
    '......DDDD......',
    '......DDDD......',
    '.......DD.......',
    '................',
    '.......DD.......',
    '......DDDD......',
    '......DDDD......',
    '.......DD.......',
    '................',
  ],
  palette: {
    D: '#667788',
  },
  tags: ['more', 'options', 'overflow', 'kebab', 'dots', 'menu', 'ui'],
  author: 'pxlkit',
};
