import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 😉 WinkingFace — 16×16 animated winking face
 *
 * A smiley face that closes one eye in a slow playful wink.
 * 2 frames — open / winking, 800ms per frame.
 *
 * Palette:
 *   Y = Yellow (#FFD700)  K = Black (#1A1A1A)  O = Outline (#CC9900)
 */
export const WinkingFace: AnimatedPxlKitData = {
  name: 'winking-face',
  size: 16,
  category: 'social',
  palette: {
    Y: '#FFD700',
    K: '#1A1A1A',
    O: '#CC9900',
  },
  frames: [
    {
      grid: [
        '................',
        '.....OOOOOO.....',
        '...OOYYYYYOO....',
        '..OYYYYYYYYYO...',
        '..OYYYKYYYKYYO..',
        '.OYYYYKYYYKYYYO.',
        '.OYYYYYY.YYYYO..',
        '.OYYYY.YYYYYYO..',
        '.OYYKYYYYYYYKO..',
        '.OYYYKKKKKKYYOO.',
        '..OYYYYYYYYYO...',
        '..OOYYYYYYYY....',
        '....OOOOOOOO....',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '.....OOOOOO.....',
        '...OOYYYYYOO....',
        '..OYYYYYYYYYO...',
        '..OYYYKYYKYYYO..',
        '.OYYYYKYYKKKYO..',
        '.OYYYYYYYYYYYO..',
        '.OYYYYYYYYYYYO..',
        '.OYYKYYYYYKYYO..',
        '.OYYYKKKKKYYYOO.',
        '..OYYYYYYYYYO...',
        '..OOYYYYYYYY....',
        '....OOOOOOOO....',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 800,
  loop: true,
  trigger: 'loop',
  tags: ['wink', 'playful', 'flirt', 'animated', 'emoji', 'social'],
  author: 'pxlkit',
};
