import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔓 LockOpen — 16×16 pixel art open padlock
 *
 * The shackle is fully lifted off the body — left arm broken, right arm
 * still attached to the body via a hinge, and a visible gap separates the
 * shackle from the body. This is the lifted/unlatched signal that makes
 * the unlock state immediately distinct from the closed `lock` icon at
 * 16 px.
 *
 *   G = Gold lock  (#FFB400)
 *   O = Outline    (#334455)
 *   K = Keyhole    (#334455)
 */
export const LockOpen: PxlKitData = {
  name: 'lock-open',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '....OOOOO.......',
    '...OGGGOO.......',
    '..OGG..GO.......',
    '..OG....O.......',
    '..OG............',
    '..OG............',
    '..OG..OOOOOOOOOO',
    '..OG.OGGGGGGGGO.',
    '.....OGGGKGGGGO.',
    '.....OGGKKKGGGO.',
    '.....OGGGKGGGGO.',
    '.....OGGGGGGGGO.',
    '.....OOOOOOOOOO.',
    '................',
    '................',
  ],
  palette: {
    G: '#FFB400',
    O: '#334455',
    K: '#334455',
  },
  tags: ['lock', 'open', 'unlock', 'access', 'security', 'ui'],
  author: 'pxlkit',
};
