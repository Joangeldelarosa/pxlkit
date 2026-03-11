import type { PxlKitData } from '@pxlkit/core';

/**
 * ⋮ DotsMenu — 16×16 pixel art vertical three-dot menu
 *
 * Three vertical dots — overflow menu, more options, kebab menu.
 *
 * Palette:
 *   D = Dot grey  (#667788)
 *   O = Outline   (#334455)
 */
export const DotsMenu: PxlKitData = {
  name: 'dots-menu',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '.....OOOOO......',
    '.....ODDDO......',
    '.....ODDDO......',
    '.....OOOOO......',
    '................',
    '.....OOOOO......',
    '.....ODDDO......',
    '.....ODDDO......',
    '.....OOOOO......',
    '................',
    '.....OOOOO......',
    '.....ODDDO......',
    '.....ODDDO......',
    '.....OOOOO......',
  ],
  palette: {
    D: '#667788',
    O: '#334455',
  },
  tags: ['more', 'options', 'overflow', 'kebab', 'dots', 'menu', 'ui'],
  author: 'pxlkit',
};
