import { createIcon } from '../icons';

/**
 * ✅✅ DoubleCheck — two overlapping checkmarks ("read" / "confirmed").
 * The back tick is darker so the pair reads as TWO checks even when
 * overlapped; both are centered in the canvas.
 */
export const DoubleCheck = createIcon(
  'double-check',
  { G: '#00CC66', D: '#008844' },
  ['double-check', 'read', 'confirmed', 'done', 'tick', 'feedback'],
  ({ line }) => {
    // back check (darker), shifted left
    line(2, 8, 5, 11, 'D');
    line(5, 11, 10, 4, 'D');
    // front check (bright), shifted right — sits on top
    line(5, 8, 8, 11, 'G');
    line(8, 11, 13, 4, 'G');
  }
);
