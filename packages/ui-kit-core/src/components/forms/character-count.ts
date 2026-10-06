/** The character counter of PixelInput and PixelTextarea (`showCount`). */
import { cn, surfaceClasses, type Surface } from '../../common';

/** `true` counts characters; `{ max }` counts them against a limit. */
export type ShowCount = boolean | { max?: number };

/** Visible characters of a field value; numbers count as their string form. */
export function getStringLength(value: unknown): number {
  if (typeof value === 'string') return value.length;
  if (typeof value === 'number') return String(value).length;
  return 0;
}

/** The limit a `showCount` sets, if any — it also caps the field's `maxlength`. */
export function showCountMax(showCount: ShowCount | undefined): number | undefined {
  return typeof showCount === 'object' && showCount !== null && typeof showCount.max === 'number'
    ? showCount.max
    : undefined;
}

/** The counter text: `N`, or `N/max` against a limit. */
export function characterCountText(length: number, max: number | undefined): string {
  return max !== undefined ? `${length}/${max}` : `${length}`;
}

/** The counter under the field; red once the count passes the limit. */
export function characterCountClasses(surface: Surface, length: number, max: number | undefined): string {
  return cn(
    'block text-right text-[10px] text-retro-muted',
    surfaceClasses(surface).font,
    max !== undefined && length > max && 'text-retro-red',
  );
}
