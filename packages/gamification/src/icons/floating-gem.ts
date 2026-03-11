import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💎 FloatingGem — 16×16 animated pixel art
 *
 * A blue diamond gem that gently bobs up and down with a sparkle.
 * 4 frames: center → up → center → down.
 */
export const FloatingGem: AnimatedPxlKitData = {
  name: 'floating-gem',
  size: 16,
  category: 'gamification',
  palette: {
    B: '#5DADE2', // gem blue
    L: '#AED6F1', // light blue
    D: '#1A5276', // dark blue
    W: '#FFFFFF', // shine
    S: '#E8F8FF', // sparkle
  },
  frames: [
    {
      // Center position
      grid: [
        '................',
        '........W.......',
        '.......BBB......',
        '.....BBLLBBB....',
        '....BLLLLLLLB...',
        '....BLLWLLLBB...',
        '....BBBBBBBBB...',
        '.....DBBBBBD....',
        '.....DDDBBDD....',
        '......DDDDD.....',
        '.......DDD......',
        '........D.......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Floating up
      grid: [
        '........W.......',
        '.......BBB......',
        '.....BBLLBBB....',
        '....BLLLLLLLB...',
        '....BLLWLLLBB...',
        '....BBBBBBBBB...',
        '.....DBBBBBD....',
        '.....DDDBBDD....',
        '......DDDDD.....',
        '.......DDD......',
        '........D.......',
        '................',
        '................',
        '..........S.....',
        '................',
        '................',
      ],
    },
    {
      // Center + sparkles
      grid: [
        '................',
        '........W.......',
        '.......BBB......',
        '....SBBLLBBBS...',
        '....BLLLLLLLB...',
        '....BLLWLLLBB...',
        '....BBBBBBBBB...',
        '.....DBBBBBD....',
        '....SDDDBBDDS...',
        '......DDDDD.....',
        '.......DDD......',
        '........D.......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Floating down
      grid: [
        '................',
        '................',
        '........W.......',
        '.......BBB......',
        '.....BBLLBBB....',
        '....BLLLLLLLB...',
        '....BLLWLLLBB...',
        '....BBBBBBBBB...',
        '.....DBBBBBD....',
        '.....DDDBBDD....',
        '......DDDDD.....',
        '.......DDD......',
        '........D.......',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 200,
  loop: true,
  trigger: 'loop',
  tags: ['gem', 'diamond', 'float', 'sparkle', 'animated', 'rpg'],
  author: 'pxlkit',
};
