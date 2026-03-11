import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚙️ Settings — 16×16 pixel art settings / wrench icon
 *
 * A horizontal three-bar settings slider — preferences, config, options.
 *
 * Palette:
 *   B = Bar blue  (#5B9BD5)
 *   D = Dark bar  (#2E6DA4)
 *   C = Circle    (#FFFFFF)
 *   O = Outline   (#334455)
 */
export const Settings: PxlKitData = {
  name: 'settings',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '.OOO......OOOO..',
    '.OBBO..CC.OBBO..',
    '.OOO......OOOO..',
    '................',
    '..OOOO......OOO.',
    '..OBBO.CC...OBO.',
    '..OOOO......OOO.',
    '................',
    '.OOOO.....OOOO..',
    '.OBO..CC..OBBO..',
    '.OOOO.....OOOO..',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
    C: '#FFFFFF',
    O: '#334455',
  },
  tags: ['settings', 'sliders', 'preferences', 'adjust', 'filter', 'ui'],
  author: 'pxlkit',
};
