import type { PxlKitData } from '@pxlkit/core';

/**
 * 🪣 PaintBucket — 16×16 pixel art paint bucket icon
 *
 * A trapezoidal bucket (wider rim, narrower base) with a curved handle on
 * top and a teal paint splash spilling out the front — the standard
 * fill-tool metaphor, no longer reading as a downward teardrop pin.
 *
 *   G = Grey bucket  (#888888)
 *   D = Dark edge    (#333333)
 *   B = Teal paint   (#4ECDC4)
 *   W = Highlight    (#DDDDDD)
 */
export const PaintBucket: PxlKitData = {
  name: 'paint-bucket',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '..DDD......DDD..',
    '.D...DDDDDD...D.',
    '.D............D.',
    '.DDDDDDDDDDDDDD.',
    '..DGGGGGGGGGGD..',
    '..DGGGGGGGGGGD..',
    '..DGWGGGGGGGGD..',
    '...DGGGGGGGGD...',
    '...DGGGGGGGGDB..',
    '....DGGGGGGD.BB.',
    '....DGGGGGGD..B.',
    '.....DGGGGD.....',
    '.....DDDDDD.....',
    '................',
    '................',
  ],
  palette: {
    G: '#888888',
    D: '#333333',
    B: '#4ECDC4',
    W: '#DDDDDD',
  },
  tags: ['bucket', 'fill', 'paint', 'tool', 'pour'],
  author: 'pxlkit',
};
