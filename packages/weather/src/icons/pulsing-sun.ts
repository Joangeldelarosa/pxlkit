import type { AnimatedPxlKitData } from '@pxlkit/core';

/**
 * ☀️ PulsingSun — 16×16 animated pulsing sun
 *
 * A sun that beats in/out, with rays extending and retracting.
 * 4 frames — glow expanding and contracting, 200ms per frame.
 *
 * Palette:
 *   Y = Yellow core (#FFD700)
 *   O = Orange rays (#FF8C00)
 *   L = Light glow  (#FFEE88)
 *   G = Glow outer  (#FFF5CC)
 */
export const PulsingSun: AnimatedPxlKitData = {
  name: 'pulsing-sun',
  size: 16,
  category: 'weather',
  palette: {
    Y: '#FFD700',
    O: '#FF8C00',
    L: '#FFEE88',
    G: '#FFF5CC',
  },
  frames: [
    {
      grid: [
        '................',
        '......O.O.O.....',
        '......O.O.O.....',
        '..O...OYYYY...O.',
        '..O..OYYYYYY..O.',
        '...OOYYYYYYOO...',
        '...OYYYYYYYYO...',
        '..OYYYYYYYYYYO..',
        '...YYYYYYYYYY...',
        '...OOYYYYYYOO...',
        '....OYYYYYYO....',
        '..O..OYYYY.O..O.',
        '..O...OOOO...O..',
        '......O.O.O.....',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '......G.G.G.....',
        '......O.O.O.....',
        '..G...O.O.O...G.',
        '..O...OYYYY...O.',
        '..O..OYYYYYY..O.',
        '...OOYYYYYYYOO..',
        '...OYYYYYYYYYO..',
        '..OYYYYYYYYYYO..',
        '...YYYYYYYYYYY..',
        '...OOYYYYYYYY...',
        '....OYYYYYYO....',
        '..O..OYYYY.O..O.',
        '..G...OOOO...G..',
        '......O.O.O.....',
        '......G.G.G.....',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '......O.O.O.....',
        '......O.O.O.....',
        '..O...OYYYY...O.',
        '..O..OYYYYYY..O.',
        '...OOYYYYYYOO...',
        '...OYYYYYYYYO...',
        '..OYYYYYYYYYYO..',
        '...YYYYYYYYYY...',
        '...OOYYYYYYYYOO.',
        '....OYYYYYYO....',
        '..O..OYYYY.O..O.',
        '..O...OOOO...O..',
        '......O.O.O.....',
        '................',
        '................',
      ],
    },
    {
      grid: [
        '................',
        '................',
        '......O.O.O.....',
        '..O...OYYYY...O.',
        '..O..OYYYYYY..O.',
        '...OOYYYYYYOO...',
        '....YYYYYYYYYY..',
        '...OYYYYYYYYYO..',
        '...OYYYYYYYYY...',
        '...OOYYYYYYY....',
        '....OYYYYYYO....',
        '..O..OYYYY.O..O.',
        '......O.O.O.....',
        '................',
        '................',
        '................',
      ],
    },
  ],
  frameDuration: 200,
  loop: true,
  trigger: 'loop',
  tags: ['sun', 'pulse', 'glow', 'bright', 'rays', 'animated', 'weather'],
  author: 'pxlkit',
};
