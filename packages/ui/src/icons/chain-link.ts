import type { PxlKitData } from '@pxlkit/core';

/**
 * 🔗 ChainLink — 16×16 pixel art chain link / hyperlink
 *
 * Two interlocked oval rings — link, hyperlink, URL, chain.
 *
 * Palette:
 *   B = Blue link  (#5B9BD5)
 *   D = Dark edge  (#2E6DA4)
 *   O = Outline    (#334455)
 */
export const ChainLink: PxlKitData = {
  name: 'chain-link',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '........OOOOO...',
    '.......ODBBBDO..',
    '......ODBBBBDO..',
    '.....OOBBBBBOO..',
    '....ODBBBBBDO...',
    '...ODBBBO.DO....',
    '...OBBBBBBDO....',
    '..ODBBBBBBDO....',
    '..OOBBBBBOOO....',
    '...ODBBBBBDO....',
    '....ODBBBBDO....',
    '.....OOOOO......',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#5B9BD5',
    D: '#2E6DA4',
    O: '#334455',
  },
  tags: ['link', 'chain', 'url', 'hyperlink', 'connect', 'ui'],
  author: 'pxlkit',
};
