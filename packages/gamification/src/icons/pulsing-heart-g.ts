import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💛 HeartPulse — a golden life-heart that pulses like a health indicator.
 * The heart shape is mirror-symmetric and the four frames scale cleanly
 * (normal → big → normal → small). The old frames were asymmetric and jumped
 * around. Gold colour is intentional (distinct from the red `heart`).
 */
const NORMAL = [
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
];

const BIG = [
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
];

const SMALL = [
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
];

export const HeartPulse: AnimatedPxlKitData = {
  name: 'heart-pulse',
  size: 16,
  category: 'gamification',
  palette: {
    G: '#FFD700', // gold heart
    D: '#B8860B', // dark gold edge
    W: '#FFF9C4', // shine
  },
  frames: [{ grid: NORMAL }, { grid: BIG }, { grid: NORMAL }, { grid: SMALL }],
  frameDuration: 220,
  loop: true,
  trigger: 'loop',
  tags: ['heart', 'life', 'health', 'gold', 'pulse', 'animated', 'rpg'],
  author: 'pxlkit',
};
