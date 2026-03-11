import type { PxlKitData } from '@pxlkit/core';

/**
 * ☰ Menu — 16×16 pixel art hamburger menu
 *
 * Three horizontal bars — navigation, sidebar, mobile menu, hamburger.
 *
 * Palette:
 *   B = Bar blue  (#5B9BD5)
 *   O = Outline   (#334455)
 */
export const Menu: PxlKitData = {
  name: 'menu',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '.OOOOOOOOOOOOOO.',
    '.OBBBBBBBBBBBBO.',
    '.OBBBBBBBBBBBBO.',
    '.OOOOOOOOOOOOOO.',
    '................',
    '.OOOOOOOOOOOOOO.',
    '.OBBBBBBBBBBBBO.',
    '.OBBBBBBBBBBBBO.',
    '.OOOOOOOOOOOOOO.',
    '................',
    '.OOOOOOOOOOOOOO.',
    '.OBBBBBBBBBBBBO.',
    '.OBBBBBBBBBBBBO.',
    '.OOOOOOOOOOOOOO.',
  ],
  palette: {
    B: '#5B9BD5',
    O: '#334455',
  },
  tags: ['menu', 'hamburger', 'nav', 'sidebar', 'toggle', 'ui'],
  author: 'pxlkit',
};
