import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔓 LockOpen — 16×16 pixel art open padlock
 *
 * A padlock with the shackle raised — unlocked, accessible, open access.
 *
 * Palette:
 *   G = Gold lock  (#FFB400)
 *   D = Dark edge  (#CC8800)
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
    '....OGGGO.......',
    '....OGGGO.......',
    '....OGGO........',
    '....OGG.........',
    'OOOOOGGOOOOOO...',
    'OGGGGGGGGGGGO...',
    'OGGGGKGGGGGGO...',
    'OGGGKKKGGGGGO...',
    'OGGGGKGGGGGGO...',
    'OGGGGGGGGGGGO...',
    'OOOOOOOOOOOOO...',
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
  tags: ['lock', 'open', 'unlock', 'access', 'security', 'ui'],
  author: 'pxlkit',
};
