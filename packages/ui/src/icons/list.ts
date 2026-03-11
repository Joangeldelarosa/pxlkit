import type { PxlKitData } from '@pxlkit/core';

/**
 * ≡ List — 16×16 pixel art list view icon
 *
 * Horizontal rows with leading dots — list view, feed, items.
 *
 * Palette:
 *   B = Bar blue  (#5B9BD5)
 *   D = Dot       (#2E6DA4)
 *   O = Outline   (#334455)
 */
export const List: PxlKitData = {
  name: 'list',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '..DD..BBBBBBBB..',
    '..DD..BBBBBBBB..',
    '................',
    '..DD..BBBBBBBB..',
    '..DD..BBBBBBBB..',
    '................',
    '..DD..BBBBBBBB..',
    '..DD..BBBBBBBB..',
    '................',
    '..DD..BBBBBBBB..',
    '..DD..BBBBBBBB..',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
    O: '#334455',
  },
  tags: ['list', 'items', 'feed', 'rows', 'ui'],
  author: 'pxlkit',
};
