import type { PxlKitData } from '@pxlkit/core';

/**
 * 😠 Angry — 16×16 pixel art angry face emoji
 *
 * Red-flushed face with V-shaped lowered brow and a grimace mouth — anger,
 * frustration. Uses the same face silhouette as the rest of the face family
 * but in red flush + dark-red outline (D) so anger reads via colour + brow.
 *
 * Palette:
 *   R = Red flush   (#FF6B6B)
 *   K = Brow/eyes/mouth (#1A1A1A)
 *   D = Dark outline    (#993300)
 */
export const Angry: PxlKitData = {
  name: 'angry',
  size: 16,
  category: 'social',
  grid: [
    '................',
    '.....DDDDDD.....',
    '...DDRRRRRRDD...',
    '..DDRRRRRRRRDD..',
    '..DRRKKRRKKRRD..',
    '.DRRRRKKKKRRRRD.',
    '.DRRRRKRRKRRRRD.',
    '.DRRRRRRRRRRRRD.',
    '.DRRRKKKKKKRRRD.',
    '.DRRKRRRRRRKRRD.',
    '..DRRRRRRRRRRD..',
    '..DDRRRRRRRRDD..',
    '...DDDDDDDDDD...',
    '................',
    '................',
    '................',
  ],
  palette: {
    R: '#FF6B6B',
    K: '#1A1A1A',
    D: '#993300',
  },
  tags: ['angry', 'rage', 'mad', 'emoji', 'face', 'social'],
  author: 'pxlkit',
};
