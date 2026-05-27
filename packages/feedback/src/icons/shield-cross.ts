import { createIcon, paintShield } from '../icons';

/**
 * 🛡️✕ ShieldCross — filled shield with a white ✕ (access denied / blocked /
 * failed protection). Shares the unified shield silhouette with
 * shield-check / shield-alert / shield-exclamation.
 */
export const ShieldCross = createIcon(
  'shield-cross',
  { S: '#E03131', D: '#9B1C1C', C: '#FFFFFF' },
  ['shield', 'cross', 'block', 'deny', 'fail', 'security', 'feedback'],
  ({ set, line }) => {
    paintShield(set, 'S', 'D');
    line(5, 5, 10, 10, 'C');
    line(10, 5, 5, 10, 'C');
  }
);
