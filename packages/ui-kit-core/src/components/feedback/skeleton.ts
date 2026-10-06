/** PixelSkeleton — a pulsing loading placeholder block (still under reduced motion). */
import { cn, surfaceClasses, type Surface } from '../../common';

/** Accessible name of a skeleton without its own label. */
export const SKELETON_DEFAULT_LABEL = 'Loading';

/** Default block height. */
export const SKELETON_DEFAULT_HEIGHT = '1rem';

/**
 * The block: the surface radius, or — `rounded` — a circle on the linear
 * surface and a 2px chamfer on the pixel one.
 */
export function skeletonClasses(surface: Surface, { rounded }: { rounded: boolean }): string {
  const radius = rounded ? (surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full') : surfaceClasses(surface).radius;
  // Still, as a plain block, for a reader who prefers reduced motion — from
  // the server markup on, as `motion-safe:` needs no script.
  return cn('motion-safe:animate-pulse bg-retro-surface/80', radius);
}
