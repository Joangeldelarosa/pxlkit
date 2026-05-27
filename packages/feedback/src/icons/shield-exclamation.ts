import { createIcon, paintShield } from '../icons';

/**
 * 🛡️! ShieldExclamation — filled shield with a white ! (critical security
 * issue). Shares the unified shield silhouette with
 * shield-check / shield-alert / shield-cross; orange marks higher severity
 * than the amber shield-alert.
 */
export const ShieldExclamation = createIcon(
  'shield-exclamation',
  { S: '#E8590C', D: '#9A3412', C: '#FFFFFF' },
  ['shield', 'exclamation', 'warning', 'alert', 'critical', 'security', 'feedback'],
  ({ set, fillRect }) => {
    paintShield(set, 'S', 'D');
    fillRect(7, 5, 2, 4, 'C');
    fillRect(7, 10, 2, 1, 'C');
  }
);
