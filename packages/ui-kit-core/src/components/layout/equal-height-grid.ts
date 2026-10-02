/**
 * PixelEqualHeightGrid — a PixelGrid (aligned `stretch`) whose items share
 * their row's height and lay out a header, a stretching body and a footer.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** `stretch` gives every item of a row the row's height; `top` keeps their own. */
export type EqualHeightGridRowAlign = 'top' | 'stretch';

/** Classes every item receives: auto header, stretching body, auto footer. */
export const equalHeightGridItemClasses = 'grid grid-rows-[auto_1fr_auto]';

/** Classes the grid adds to PixelGrid's own. */
export function equalHeightGridClasses(surface: Surface, rowAlign: EqualHeightGridRowAlign): string {
  return cn(rowAlign === 'top' && 'items-start', surfaceClasses(surface).transition);
}
