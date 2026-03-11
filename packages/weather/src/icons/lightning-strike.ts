import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * ⚡ LightningStrike — 16×16 animated lightning bolt
 *
 * A lightning bolt that flashes — strike, thunder, electric, storm.
 * 4 frames — bolt on / off, cloud flash, 90ms per frame.
 *
 * Palette:
 *   Y = Lightning   (#FFE500)
 *   W = White flash (#FFFFFF)
 *   C = Cloud grey  (#778899)
 *   D = Dark cloud  (#445566)
 */
export const LightningStrike: AnimatedPxlKitData = {
  name: 'lightning-strike',
  size: 16,
  category: 'weather',
  palette: {
    Y: '#FFE500',
    W: '#FFFFFF',
    C: '#778899',
    D: '#445566',
  },
  frames: [
    {
      grid: [
        '................',
        '...DCCCCCCD.....',
        '..DCCCCCCCCD....',
        '..DCCCCCCCCCD...',
        '...CCCCCCCCCD...',
        '....CCCCCCCC....',
        '.......YY.......',
        '......YYY.......',
        '.....YYYY.......',
        '......YYY.......',
        '.......YY.......',
        '........Y.......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '...DCCCCCCD.....',
        '..DCWWWWWWCD....',
        '..DCWWWWWWWCD...',
        '...CWWWWWWWCD...',
        '....CCCCCCCC....',
        '.......WY.......',
        '......WYY.......',
        '.....WYYYY......',
        '......WYY.......',
        '.......WY.......',
        '........W.......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '...DCCCCCCD.....',
        '..DCCCCCCCCD....',
        '..DCCCCCCCCCD...',
        '...CCCCCCCCCD...',
        '....CCCCCCCC....',
        '................',
        '................',
        '................',
        '................',
        '................',
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
        '...DCCCCCCD.....',
        '..DCCCCCCCCD....',
        '..DCCCCCCCCCD...',
        '...CCCCCCCCCD...',
        '....CCCCCCCC....',
        '.......YY.......',
        '......YYY.......',
        '.....YYYY.......',
        '......YYY.......',
        '.......YY.......',
        '........Y.......',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 90,
  loop: true,
  trigger: 'loop',
  tags: ['lightning', 'thunder', 'storm', 'strike', 'electric', 'animated', 'weather'],
  author: 'pxlkit',
};
