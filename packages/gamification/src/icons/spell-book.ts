import type { PxlKitData } from '@pxlkit/core';

/**
 * 📖 SpellBook — 16×16 pixel art magic spellbook
 *
 * A thick brown tome with violet pages and a gold gem clasp.
 *
 * Palette:
 *   B = Brown cover  (#8B4513)
 *   D = Dark edge    (#5C2E00)
 *   V = Violet pages (#9B59B6)
 *   G = Gold clasp   (#FFD700)
 *   P = Page glow    (#C39BD3)
 */
export const SpellBook: PxlKitData = {
  name: 'spell-book',
  size: 16,
  category: 'gamification',
  grid: [
    '...DBBBBBBBBBD..',
    '..GBBBBBBBBBBG..',
    '..GBVVVVVVVVBG..',
    '..GBVPPVVPPVBG..',
    '..GBVPGGGGPVBG..',
    '..GBVPPVVPPVBG..',
    '..GBVVPPPPVVBG..',
    '..GBVVVVVVVVBG..',
    '..GBVVVVVVVVBG..',
    '..GBVVVVVVVVBG..',
    '..GBBBBBBBBBBG..',
    '..GBBBBBBBBBBG..',
    '...DBBBBBBBBBD..',
    '................',
    '................',
    '................',
  ],
  palette: {
    B: '#8B4513',
    D: '#5C2E00',
    V: '#9B59B6',
    G: '#FFD700',
    P: '#C39BD3',
  },
  tags: ['spell-book', 'tome', 'magic', 'book', 'wizard', 'knowledge', 'rpg'],
  author: 'pxlkit',
};
