import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💛 HeartPulse — 16×16 animated pixel art
 *
 * A golden life-heart that pulses like a health indicator.
 * 4 frames: normal → expand → normal → small.
 */
export const HeartPulse: AnimatedPxlKitData = {
  name: 'heart-pulse',
  size: 16,
  category: 'gamification',
  palette: {
    G: '#FFD700', // gold heart
    D: '#B8860B', // dark gold
    W: '#FFF9C4', // shine
  },
  frames: [
    {
      // Normal
      grid: [
        '................',
        '................',
        '......W.........',
        '..DGG....GGD....',
        '.DGGGG..GGGGD...',
        '.DGGGGGGGGGGD...',
        '.DGGDGGGGDGGD...',
        '..DGGGGGGGGD....',
        '...DGGGGGGD.....',
        '....DGGGGD......',
        '.....DGGD.......',
        '......DD........',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Beat peak — expand slightly
      grid: [
        '................',
        '......W.........',
        '.WGG.....GGGW...',
        '.GGGGG..GGGGGD..',
        '.GWGGGGGGGGGGD..',
        '.GGGGGGGGGGGDD..',
        '.GGGGGGGGGGGD...',
        '.GGGGGGGGGGGG...',
        '...GGGGGGGGG....',
        '...GGGGGGGG.....',
        '.....GGGGG......',
        '.....GGGG.......',
        '.......G........',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Normal
      grid: [
        '................',
        '................',
        '......W.........',
        '..WGG....GGGW...',
        '..GGGG..GGGGG...',
        '..GGGGGGGGGGG...',
        '..GGGDGGGGGGG...',
        '..GGGGGGGGGGG...',
        '....GGGGGGG.....',
        '.....GGGGG......',
        '.....GGGGG......',
        '.......G........',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Resting (smaller)
      grid: [
        '................',
        '................',
        '................',
        '................',
        '....GG....GG....',
        '....GGGGGGGG....',
        '....GGGGGGGG....',
        '.....GGGGGG.....',
        '......GGGG......',
        '.......GG.......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 220,
  loop: true,
  trigger: 'loop',
  tags: ['heart', 'life', 'health', 'gold', 'pulse', 'animated', 'rpg'],
  author: 'pxlkit',
};
