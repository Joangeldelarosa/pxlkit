import type { PxlKitData, SvgOptions } from '../types';
import { gridToPixels } from './gridToPixels';
import { pixelsToSvg } from './pixelsToSvg';

/**
 * Converts a PxlKitData directly to an SVG string.
 * Shorthand for gridToPixels() → pixelsToSvg().
 *
 * @param icon - The pixel icon data
 * @param options - SVG generation options
 * @returns SVG markup string
 *
 * @example
 * ```ts
 * import { gridToSvg, Trophy } from '@pxlkit/gamification';
 *
 * // Colorful SVG
 * const svg = gridToSvg(Trophy, { mode: 'colorful' });
 *
 * // Monochrome SVG
 * const mono = gridToSvg(Trophy, { mode: 'monochrome', monoColor: '#333' });
 * ```
 */
export function gridToSvg(
  icon: PxlKitData,
  options: SvgOptions = { mode: 'colorful' }
): string {
  const pixels = gridToPixels(icon);
  return pixelsToSvg(pixels, icon.size, options);
}
