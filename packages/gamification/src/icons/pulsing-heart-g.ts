import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💛 HeartPulse — a golden life-heart that pulses (normal → big → normal →
 * small). Mirror-symmetric shape; gold colour is intentional (distinct from the
 * red `heart`).
 *
 *   G = gold heart (#FFD700)
 *   D = dark gold edge (#B8860B)
 *   W = shine (#FFF9C4)
 */
export const HeartPulse: AnimatedPxlKitData = {
  name: 'heart-pulse',
  size: 16,
  category: 'gamification',
  palette: {
    G: '#FFD700',
    D: '#B8860B',
    W: '#FFF9C4',
  },
  frames: [
    {
      grid: [
        '................',
        '................',
        '....GG....GG....',
        '...WGGG..GGGG...',
        '..GGGGGGGGGGGG..',
        '..GGGGGGGGGGGGD.',
        '...GGGGGGGGGGD..',
        '....GGGGGGGGD...',
        '.....GGGGGGD....',
        '......GGGGD.....',
        '.......GG.......',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '....GG....GG....',
        '...GGGG..GGGG...',
        '..WGGGGGGGGGGG..',
        '.GGGGGGGGGGGGGG.',
        '..GGGGGGGGGGGGD.',
        '...GGGGGGGGGGD..',
        '....GGGGGGGGD...',
        '.....GGGGGGD....',
        '......GGGGD.....',
        '.......GG.......',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '....GG....GG....',
        '...WGGG..GGGG...',
        '..GGGGGGGGGGGG..',
        '..GGGGGGGGGGGGD.',
        '...GGGGGGGGGGD..',
        '....GGGGGGGGD...',
        '.....GGGGGGD....',
        '......GGGGD.....',
        '.......GG.......',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '................',
        '................',
        '.....GG..GG.....',
        '....GGGGGGGG....',
        '....GGGGGGGGD...',
        '.....GGGGGGD....',
        '......GGGGD.....',
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
