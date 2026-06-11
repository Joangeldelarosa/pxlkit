/**
 * Returns the visible character length of an input value, treating numbers as
 * their string form. Used by PixelInput + PixelTextarea to render `showCount`.
 *
 * Internal helper. Do NOT re-export from `inputs/index.ts`.
 */
export function getStringLength(v: unknown): number {
  if (typeof v === 'string') return v.length;
  if (typeof v === 'number') return String(v).length;
  return 0;
}
