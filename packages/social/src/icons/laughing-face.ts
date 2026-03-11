import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 😂 LaughingFace — 16×16 animated laughing face
 *
 * A laughing face that shakes side-to-side with tear streaks.
 * 3 frames — normal / tilted-left / tilted-right, 130ms per frame.
 *
 * Palette:
 *   Y = Yellow (#FFD700)  K = Black (#1A1A1A)  O = Outline (#CC9900)
 *   B = Blue tear (#4FC3F7)  W = White teeth (#FFFFFF)
 */
export const LaughingFace: AnimatedPxlKitData = {
  name: 'laughing-face',
  size: 16,
  category: 'social',
  palette: {
    Y: '#FFD700',
    K: '#1A1A1A',
    O: '#CC9900',
    B: '#4FC3F7',
    W: '#FFFFFF',
  },
  frames: [
    {
      grid: [
        '................',
        '.....OOOOOO.....',
        '...OOYYYYYOO....',
        '..OYYYYYYYYYO...',
        '..OYYKYYYKYYO...',
        '.OYYYKYYYKYYYYO.',
        '.OYYYYYKKYYYYO..',
        '.OYYKKW.KKKYYO..',
        '.OYYKWW.WWKKYOO.',
        '.OYYKKWW.WKKYOO.',
        '.BBOYYYYYYYYO...',
        '..BOOYYYYYOO....',
        '....OOOOOOOO....',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '......OOOOOO....',
        '....OOYYYYYOO...',
        '...OYYYYYYYYYO..',
        '...OYYKYYYKYYO..',
        '..OYYYKYYYKYYYO.',
        '..OYYYYYYYYYYYO.',
        '..OYYKKKKKKKYYO.',
        '..OYYYWWWWWKYYO.',
        '..OYYYKKKKKKYYOO',
        '...BOYYYYYYYYO..',
        '....BOOYYYYYOO..',
        '.....OOOOOOOO...',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '....OOOOOO......',
        '..OOYYYYYOO.....',
        '.OYYYYYYYYYO....',
        '.OYYKYYYKYYO....',
        'OYYYKYYYKYYYYO..',
        'OYYYYYYYYYYYO...',
        'OYYKKKKKKKYYO...',
        'OYYYWWWWWKYYOO..',
        'OYYYKKKKKKYYOO..',
        '.BOYYYYYYYYO....',
        '.BOOYYYYYOO.....',
        '...OOOOOOOO.....',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 130,
  loop: true,
  trigger: 'loop',
  tags: ['laugh', 'lol', 'funny', 'animated', 'emoji', 'social'],
  author: 'pxlkit',
};
