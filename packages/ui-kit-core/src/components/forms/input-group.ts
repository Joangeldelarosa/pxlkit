/** PixelInputGroup — form controls joined into a single shell. */
import { cn, sizeHeight, surfaceClasses, type Size, type Surface } from '../../common';

/** The shell around the joined controls. */
export function inputGroupClasses(surface: Surface, size: Size): string {
  const s = surfaceClasses(surface);
  return cn(
    'inline-flex w-full items-stretch overflow-hidden',
    sizeHeight[size],
    s.border,
    s.radius,
    'border-retro-border/60 bg-retro-surface/40',
    s.font,
  );
}

/**
 * A control inside the group: it loses its own border and corners, so the
 * controls read as one shell, and gains a divider unless it is the last. The
 * shell clips the controls (`overflow-hidden`), focus rings included, so a
 * control shows keyboard focus inside its own edge.
 */
export function inputGroupItemClasses(last: boolean): string {
  return cn(
    'min-w-0 border-0 rounded-none focus:z-10 focus-visible:z-10 focus-visible:pxl-focus-inset relative',
    !last && 'border-r border-retro-border/60',
  );
}

/**
 * Role of the group: the one given, else `group` — but only with an
 * accessible name, so screen readers never announce an unlabelled group.
 */
export function inputGroupRole(role: string | undefined, named: boolean): string | undefined {
  return role ?? (named ? 'group' : undefined);
}

/** Dev-mode warning for a group of several controls without an accessible name. */
export const INPUT_GROUP_UNNAMED_WARNING =
  '[PixelInputGroup] missing aria-label / aria-labelledby. A group of joined ' +
  'controls is unintelligible to SR users without an accessible name.';
