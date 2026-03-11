import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * ● PulsingDot — 16×16 animated pulsing notification dot
 *
 * A colored dot that pulses (shrinks and expands) — live, online, notification.
 * 4 frames — large / medium / small / medium, 250ms per frame.
 *
 * Palette:
 *   R = Red dot    (#E74C3C)
 *   L = Light halo (#FF8FA0)
 *   G = Glow outer (#FFCCCC)
 */
export const PulsingDot: AnimatedPxlKitData = {
  name: 'pulsing-dot',
  size: 16,
  category: 'ui',
  palette: {
    R: '#E74C3C',
    L: '#FF8FA0',
    G: '#FFCCCC',
  },
  frames: [
    {
      grid: [
        '................',
        '................',
        '......GGGG......',
        '.....GRRRG......',
        '....GRRRRRRG....',
        '....GRRRRRRG....',
        '....GRRRRRRG....',
        '....GRRRRRRG....',
        '.....GRRRG......',
        '......GGGG......',
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
        '................',
        '................',
        '......LLLL......',
        '.....LRRRL......',
        '....LRRRRRRL....',
        '....LRRRRRRL....',
        '.....LRRRL......',
        '......LLLL......',
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
        '................',
        '................',
        '................',
        '.......RRR......',
        '......RRRR......',
        '......RRRR......',
        '.......RRR......',
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
        '................',
        '................',
        '......LLLL......',
        '.....LRRRL......',
        '....LRRRRRRL....',
        '....LRRRRRRL....',
        '.....LRRRL......',
        '......LLLL......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 250,
  loop: true,
  trigger: 'loop',
  tags: ['dot', 'pulse', 'live', 'online', 'notification', 'animated', 'ui'],
  author: 'pxlkit',
};
