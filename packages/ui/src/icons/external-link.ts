import type { PxlKitData } from '@pxlkit/core';

/**
 * ↗️ ExternalLink — 16×16 pixel art external link / open in new tab
 *
 * A square with an arrow pointing to the top-right corner.
 *
 * Palette:
 *   B = Blue arrow (#5B9BD5)
 *   O = Outline    (#334455)
 *   W = Window     (#FFFFFF)
 */
export const ExternalLink: PxlKitData = {
  name: 'external-link',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '........BBBBBBB.',
    '.......BBBBBBB..',
    '......BBBBBB....',
    '.....BBBBBBB....',
    '.OOOO..BBBB.....',
    '.OWWOO..BB......',
    '.OWWWOO.B.......',
    '.OWWWWOO........',
    '.OWWWWWOO.......',
    '.OWWWWWWOO......',
    '.OWWWWWWWOO.....',
    '.OOOOOOOOOOO....',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    O: '#334455',
    W: '#FFFFFF',
  },
  tags: ['external', 'link', 'open', 'new-tab', 'navigate', 'ui'],
  author: 'pxlkit',
};
