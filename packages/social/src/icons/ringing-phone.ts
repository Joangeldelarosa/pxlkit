import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * 📱 RingingPhone — 16×16 animated ringing phone
 *
 * A mobile phone shaking left and right with notification vibration.
 * 4 frames — center / left / center / right, 120ms per frame.
 *
 * Palette:
 *   G = Grey body   (#667788)
 *   D = Dark edge   (#445566)
 *   S = Screen      (#7EC8E3)
 *   R = Red notif   (#E74C3C)
 *   W = White dot   (#FFFFFF)
 */
export const RingingPhone: AnimatedPxlKitData = {
  name: 'ringing-phone',
  size: 16,
  category: 'social',
  palette: {
    G: '#667788',
    D: '#445566',
    S: '#7EC8E3',
    R: '#E74C3C',
    W: '#FFFFFF',
  },
  frames: [
    {
      grid: [
        '................',
        '...DGGGGGGD.....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSRWSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GGGDGGGGG....',
        '....GGDGG.......',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '..DGGGGGGD......',
        '..GSSSSSSSG.....',
        '..GSSSSSSSG.....',
        '..GSSRWSSSG.....',
        '..GSSSSSSSG.....',
        '..GSSSSSSSG.....',
        '..GSSSSSSSG.....',
        '..GSSSSSSSG.....',
        '..GSSSSSSSG.....',
        '..GSSSSSSSG.....',
        '..GGGDGGGGG.....',
        '...GGDGG........',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '...DGGGGGGD.....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSRWSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GSSSSSSSG....',
        '...GGGDGGGGG....',
        '....GGDGG.......',
        '................',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '....DGGGGGGD....',
        '....GSSSSSSSG...',
        '....GSSSSSSSG...',
        '....GSSRWSSSG...',
        '....GSSSSSSSG...',
        '....GSSSSSSSG...',
        '....GSSSSSSSG...',
        '....GSSSSSSSG...',
        '....GSSSSSSSG...',
        '....GSSSSSSSG...',
        '....GGGDGGGGG...',
        '.....GGDGG......',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 120,
  loop: true,
  trigger: 'hover',
  tags: ['phone', 'ring', 'call', 'notify', 'vibrate', 'animated', 'social'],
  author: 'pxlkit',
};
