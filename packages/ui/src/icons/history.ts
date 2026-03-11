import type { PxlKitData } from '@pxlkit/core';

/**
 * 🕐 History — 16×16 pixel art history / time-back icon
 *
 * A circular clock with a counter-clockwise arrow — undo, history, back.
 *
 * Palette:
 *   G = Grey clock (#AABBCC)
 *   B = Blue arrow (#5B9BD5)
 *   O = Outline    (#334455)
 *   H = Hand       (#2E6DA4)
 */
export const History: PxlKitData = {
  name: 'history',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '.....BBB........',
    '....BBBOOOO.....',
    '...BBOGGGGOO....',
    '..BOGGGGGGGO....',
    '..OGGHHGGGGGO...',
    '.OGGGHHHGGGGO...',
    '.OGGGGHHGGGGO...',
    '.OGGGGGGGGGGO...',
    '.OGGGGGGGGGGO...',
    '..OGGGGGGGGO....',
    '..OOGGGGGOO.....',
    '...OOOOOO.......',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#AABBCC',
    B: '#5B9BD5',
    O: '#334455',
    H: '#2E6DA4',
    A: '#889099',
  },
  tags: ['history', 'undo', 'back', 'time', 'past', 'ui'],
  author: 'pxlkit',
};
