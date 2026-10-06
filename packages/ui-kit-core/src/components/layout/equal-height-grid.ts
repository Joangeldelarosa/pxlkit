/**
 * PixelEqualHeightGrid — a PixelGrid whose items share their row's height and
 * lay out a header, a stretching body and a footer.
 */
import { surfaceClasses, type Surface } from '../../common';
import type { GridAlign } from './grid';

/** `stretch` gives every item of a row the row's height; `top` keeps their own. */
export type EqualHeightGridRowAlign = 'top' | 'stretch';

/** Classes every item receives: auto header, stretching body, auto footer. */
export const equalHeightGridItemClasses = 'grid grid-rows-[auto_1fr_auto]';

/**
 * The `align` of the PixelGrid underneath: its items stretch to the row's
 * height, or stay at the top of the row at their own.
 */
export function equalHeightGridAlign(rowAlign: EqualHeightGridRowAlign): GridAlign {
  return rowAlign === 'top' ? 'start' : 'stretch';
}

/** Classes the grid adds to PixelGrid's own. */
export function equalHeightGridClasses(surface: Surface): string {
  return surfaceClasses(surface).transition;
}
