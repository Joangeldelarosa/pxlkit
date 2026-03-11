import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔒 Lock — 16×16 pixel art closed padlock
 *
 * A closed padlock for secure/private states.
 *
 * Palette:
 *   G = Gold lock  (#FFB400)
 *   D = Dark edge  (#CC8800)
 *   O = Outline    (#334455)
 *   K = Keyhole    (#334455)
 */
export const Lock: PxlKitData = {
  name: 'lock',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '....OOOOO.......',
    '...OOGGGOO......',
    '...OGGGGGO......',
    '...OGGGGGO......',
    '...OGGGGGO......',
    'OOOOOGGGOOOOOO..',
    'OGGGGGGGGGGGGO..',
    'OGGGGKGGGGGGGO..',
    'OGGGKKKGGGGGGO..',
    'OGGGGKGGGGGGGO..',
    'OGGGGGGGGGGGGO..',
    'OOOOOOOOOOOOOO..',
    '................',
    '................',
    '................',
  ],
  palette: {
    G: '#FFB400',
    D: '#CC8800',
    O: '#334455',
    K: '#334455',
  },
  tags: ['lock', 'secure', 'private', 'security', 'closed', 'ui'],
  author: 'pxlkit',
};
