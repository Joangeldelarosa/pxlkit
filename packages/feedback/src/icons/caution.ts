import { createIcon } from '../icons';

/**
 * ⚠️🚧 Caution — centered, symmetric hazard triangle filled with bold
 * yellow/black diagonal stripes inside an orange border. Stronger than a
 * plain warning — physical danger / critical state. Stripes are ~3px so they
 * still read at small sizes; the triangle is centered in the 16×16 canvas.
 *
 *   O = Orange border (#E67E22)
 *   Y = Yellow stripe (#FFD700)
 *   B = Black stripe   (#1A1A1A)
 */
const SPAN: Record<number, [number, number]> = {
  2: [7, 8],
  3: [6, 9],
  4: [6, 9],
  5: [5, 10],
  6: [5, 10],
  7: [4, 11],
  8: [4, 11],
  9: [3, 12],
  10: [3, 12],
  11: [2, 13],
  12: [2, 13],
  13: [1, 14],
};

export const Caution = createIcon(
  'caution',
  { O: '#E67E22', Y: '#FFD700', B: '#1A1A1A' },
  ['caution', 'hazard', 'danger', 'warning', 'stripe', 'feedback'],
  ({ set }) => {
    for (let y = 2; y <= 13; y += 1) {
      const [left, right] = SPAN[y];
      for (let x = left; x <= right; x += 1) {
        const edge = x === left || x === right || y === 13;
        set(x, y, edge ? 'O' : (x + y) % 6 < 3 ? 'Y' : 'B');
      }
    }
  }
);
