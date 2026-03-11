import type { AnimatedPxlKitData } from '@pxlkit/core';

// ─── Blinking Eye (6 frames) ───────────────
// An eye that blinks periodically.

export const BlinkingEye: AnimatedPxlKitData = {
  name: 'blinking-eye',
  size: 16,
  category: 'social',
  palette: {
    W: '#FFFFFF', // sclera
    I: '#3B82F6', // iris
    P: '#1E293B', // pupil
    E: '#CBD5E1', // eyelid
    D: '#94A3B8', // lid shadow
  },
  frames: [
    {
      // Open
      grid: [
        '................',
        '................',
        '................',
        '....DDDDDDDD....',
        '...DWWWWWWWWD...',
        '..DWWWWIIIWWWD..',
        '..DWWWIPPIWWWD..',
        '..DWWWIPPIWWWD..',
        '..DWWWIIIWWWWD..',
        '...DWWWWWWWWD...',
        '....DDDDDDDD....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Open (held)
      grid: [
        '................',
        '................',
        '................',
        '....DDDDDDDD....',
        '...DWWWWWWWWD...',
        '..DWWWWIIIWWWD..',
        '..DWWWIPPIWWWD..',
        '..DWWWIPPIWWWD..',
        '..DWWWIIIWWWWD..',
        '...DWWWWWWWWD...',
        '....DDDDDDDD....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Starting to close
      grid: [
        '................',
        '................',
        '................',
        '....DDDDDDDD....',
        '...DEEEEEEEED...',
        '..DEWWWWWWWWED..',
        '..DWWWWIIIWWWD..',
        '..DWWWIPPIWWWD..',
        '..DEWWWIIIWWED..',
        '...DEEEEEEEED...',
        '....DDDDDDDD....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Half closed
      grid: [
        '................',
        '................',
        '................',
        '....DDDDDDDD....',
        '...DEEEEEEEED...',
        '..DEEEEEEEEEED..',
        '..DEWWWIIIWWED..',
        '..DEWWWIPPIWED..',
        '..DEEEEEEEEEED..',
        '...DEEEEEEEED...',
        '....DDDDDDDD....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Closed
      grid: [
        '................',
        '................',
        '................',
        '....DDDDDDDD....',
        '...DEEEEEEEED...',
        '..DEEEEEEEEEED..',
        '..DEEEEEEEEEED..',
        '..DDDDDDDDDDDD..',
        '..DEEEEEEEEEED..',
        '...DEEEEEEEED...',
        '....DDDDDDDD....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      // Reopening
      grid: [
        '................',
        '................',
        '................',
        '....DDDDDDDD....',
        '...DEEEEEEEED...',
        '..DEEEEEEEEEED..',
        '..DEWWWIIIWWED..',
        '..DEWWWIPPIWED..',
        '..DEEEEEEEEEED..',
        '...DEEEEEEEED...',
        '....DDDDDDDD....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 150,
  loop: true,
  trigger: 'loop',
  tags: ['eye', 'blink', 'watch', 'look', 'animated', 'face'],
  author: 'pxlkit',
};
