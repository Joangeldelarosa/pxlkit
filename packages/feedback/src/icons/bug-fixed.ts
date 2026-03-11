import type { PxlKitData } from '@pxlkit/core';

/**
 * 🐛✓ BugFixed — 16×16 pixel art "bug fixed" status icon
 *
 * A bug with a green checkmark overlay — represents resolved issues.
 *
 * Palette:
 *   R = Red bug  (#E74C3C)
 *   D = Dark bug (#A93226)
 *   G = Green ok (#27AE60)
 *   W = White    (#FFFFFF)
 *   B = Black    (#1A1A1A)
 */
export const BugFixed: PxlKitData = {
  name: 'bug-fixed',
  size: 16,
  category: 'feedback',
  grid: [
    '................',
    '..BB......BB....',
    '.BBB......BBB...',
    '...RRRRRRRR.....',
    '..RRWRRWRRRR....',
    '..RRRRRRRRRR.G..',
    'B.RRRRRRRRRGG...',
    'B.RRDDDDDDRGG...',
    'B.RRRRRRRRGGR...',
    '..RRRRRRRGGRR...',
    '..RRRRRRGGRR....',
    '...RRRRGGR......',
    '.BBB...GG..BBB..',
    '..BB....G...BB..',
    '..BB.......BB...',
    '................',
  ],
  palette: {
    R: '#E74C3C',
    D: '#A93226',
    G: '#27AE60',
    W: '#FFFFFF',
    B: '#1A1A1A',
  },
  tags: ['bug', 'fixed', 'resolved', 'solved', 'done', 'feedback'],
  author: 'pxlkit',
};
