import type { PxlKitData } from '@pxlkit/core';

/**
 * 😠 Angry — 16×16 pixel art angry face emoji
 *
 * Red-flushed face with furrowed brow and grimace — anger, frustration.
 *
 * Palette:
 *   R = Red flush   (#FF6B6B)
 *   O = Orange mix  (#FF8C42)
 *   K = Black       (#1A1A1A)
 *   D = Dark brow   (#993300)
 */
export const Angry: PxlKitData = {
  name: 'angry',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '....DDDDDDDD....',
    '...DDRRRRRRDD...',
    '..DDRRRRRRRRDD..',
    '..DRKKRRRRKKRD..',
    '.DDRRDKKKKDRRDD.',
    '.DRRRRKRRKRRRD..',
    '.DRRRRRRRRRRRD..',
    '.DRRRRKKKKRRRD..',
    '.DRRRKKDDKKRRD..',
    '..DRRDKRRKDRD...',
    '..DDRRRRRRRRDD..',
    '...DDDDDDDDDD...',
    '................',
    '................',
    '................',
  ],
  palette: {
    R: '#FF6B6B',
    O: '#FF8C42',
    K: '#1A1A1A',
    D: '#993300',
  },
  tags: ['angry', 'rage', 'mad', 'emoji', 'face', 'social'],
  author: 'pxlkit',
};
