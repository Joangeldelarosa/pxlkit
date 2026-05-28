import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * ✨ SparkleStar — the mirror-symmetric gold star with a white sparkle that
 * rotates around the four corners (4 frames).
 *
 *   Y = star gold (#FFD700)
 *   D = star shadow (#DAA520)
 *   W = sparkle (#FFFFFF)
 */
export const SparkleStar: AnimatedPxlKitData = {
  name: 'sparkle-star',
  size: 16,
  category: 'gamification',
  palette: {
    Y: '#FFD700',
    D: '#DAA520',
    W: '#FFFFFF',
  },
  frames: [
    {
      grid: [
        '.......YY.......',
        '..W....YY.......',
        '.WWW..YYYY......',
        '..W...YYYY......',
        'YYYYYYYYYYYYYYYY',
        '.YYYYYYYYYYYYYY.',
        '..YYYYYYYYYYYY..',
        '...YYYYYYYYYY...',
        '...YYYYYYYYYY...',
        '..YYYYY..YYYYY..',
        '..YYY......YYY..',
        '.DYY........YYD.',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '.......YY.......',
        '.......YY....W..',
        '......YYYY..WWW.',
        '......YYYY...W..',
        'YYYYYYYYYYYYYYYY',
        '.YYYYYYYYYYYYYY.',
        '..YYYYYYYYYYYY..',
        '...YYYYYYYYYY...',
        '...YYYYYYYYYY...',
        '..YYYYY..YYYYY..',
        '..YYY......YYY..',
        '.DYY........YYD.',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '.......YY.......',
        '.......YY.......',
        '......YYYY......',
        '......YYYY......',
        'YYYYYYYYYYYYYYYY',
        '.YYYYYYYYYYYYYY.',
        '..YYYYYYYYYYYY..',
        '...YYYYYYYYYY...',
        '...YYYYYYYYYY...',
        '..YYYYY..YYYYY..',
        '..YYY......YYY..',
        '.DYY........YYD.',
        '.............W..',
        '............WWW.',
        '.............W..',
        '................',
      ],
    },
    {
      grid: [
        '.......YY.......',
        '.......YY.......',
        '......YYYY......',
        '......YYYY......',
        'YYYYYYYYYYYYYYYY',
        '.YYYYYYYYYYYYYY.',
        '..YYYYYYYYYYYY..',
        '...YYYYYYYYYY...',
        '...YYYYYYYYYY...',
        '..YYYYY..YYYYY..',
        '..YYY......YYY..',
        '.DYY........YYD.',
        '..W.............',
        '.WWW............',
        '..W.............',
        '................',
      ],
    },
  ],
  frameDuration: 200,
  loop: true,
  trigger: 'loop',
  tags: ['star', 'sparkle', 'shine', 'magic', 'animated', 'effect'],
  author: 'pxlkit',
};
