import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 💀 FloatingSkull — 16×16 animated pixel art
 *
 * A white skull that softly bobs up and down with a ghostly fade effect.
 * 4 frames: idle → rise → idle → sink.
 */
export const FloatingSkull: AnimatedPxlKitData = {
  name: 'floating-skull',
  size: 16,
  category: 'gamification',
  palette: {
    W: '#C4CAD8', // pale ghost (was #EEEEEE — invisible on a light background)
    D: '#6E7486', // shadow (darker for definition)
    K: '#1A1A2E', // eye socket black
    T: '#AFAFD8', // ghostly wisp tint
  },
  frames: [
    {
      // Center position
      grid: [
        '................',
        '.....WWWWWW.....',
        '....WWWWWWWW....',
        '...WWWWWWWWWW...',
        '...WWKWWWWKWW...',
        '...WWKKWWKKWW...',
        '...WWWWWWWWWW...',
        '...WWWDWWWWDWW..',
        '....WDWWDDWDW...',
        '.....WWWWWWW....',
        '.....WWWWWWW....',
        '.....W.WW.W.....',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Floating up
      grid: [
        '.....WWWWWW.....',
        '....WWWWWWWW....',
        '...WWWWWWWWWW...',
        '...WWKWWWWKWW...',
        '...WWKKWWKKWW...',
        '...WWWWWWWWWW...',
        '...WWWDWWWWDWW..',
        '....WDWWDDWDW...',
        '.....WWWWWWW....',
        '.....WWWWWWW....',
        '.....W.WW.W.....',
        '................',
        '................',
        '..T...........T.',
        '................',
        '................',
      ],
    },
    {
      // Center + ghost wisps
      grid: [
        '................',
        '.T...WWWWWW.....',
        '....WWWWWWWW....',
        '...WWWWWWWWWW...',
        '...WWKWWWWKWW...',
        '...WWKKWWKKWW...',
        '...WWWWWWWWWW...',
        '...WWWDWWWWDWW..',
        '....WDWWDDWDW...',
        '.....WWWWWWW....',
        '.....WWWWWWW....',
        '.....W.WW.W.T...',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Sinking down
      grid: [
        '................',
        '................',
        '.....WWWWWW.....',
        '....WWWWWWWW....',
        '...WWWWWWWWWW...',
        '...WWKWWWWKWW...',
        '...WWKKWWKKWW...',
        '...WWWWWWWWWW...',
        '...WWWDWWWWDWW..',
        '....WDWWDDWDW...',
        '.....WWWWWWW....',
        '.....WWWWWWW....',
        '.....W.WW.W.....',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 250,
  loop: true,
  trigger: 'loop',
  tags: ['skull', 'ghost', 'float', 'undead', 'death', 'animated', 'rpg'],
  author: 'pxlkit',
};
