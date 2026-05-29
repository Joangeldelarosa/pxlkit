import type { PxlKitData } from '@pxlkit/core';

/**
 * ⚙️ Settings — 16×16 pixel art settings / preferences icon
 *
 * Three horizontal slider bars with white knobs at different positions —
 * the universal "preferences / adjust / filter" pattern used on mobile and
 * desktop. Knobs sit left / middle / right so the icon reads as adjustment
 * even at 16 px.
 *
 *   B = Bar blue (#5B9BD5)
 *   W = Knob     (#FFFFFF)
 */
export const Settings: PxlKitData = {
  name: 'settings',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '................',
    '.WWWBBBBBBBBBBB.',
    '.WWWBBBBBBBBBBB.',
    '................',
    '................',
    '.BBBBBWWWBBBBBB.',
    '.BBBBBWWWBBBBBB.',
    '................',
    '................',
    '.BBBBBBBBBBBWWW.',
    '.BBBBBBBBBBBWWW.',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    W: '#FFFFFF',
  },
  tags: ['settings', 'sliders', 'preferences', 'adjust', 'filter', 'ui'],
  author: 'pxlkit',
};
