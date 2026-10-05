/**
 * PixelIconButton (and PxlKitButton, its deprecated alias) — a square,
 * icon-only button named by its required label.
 */
import { cn, cornerShadowClasses, focusRing, sizeSquare, surfaceClasses, toneMap, type Size, type Surface, type Tone } from '../../common';

export interface IconButtonOptions {
  tone: Tone;
  size: Size;
  /** A disabled button drops its shadows and holds still. */
  disabled: boolean;
}

/** The square button. */
export function iconButtonClasses(surface: Surface, { tone, size, disabled }: IconButtonOptions): string {
  const s = surfaceClasses(surface);
  const c = cornerShadowClasses(surface);
  const t = toneMap[tone];
  return cn(
    'inline-flex items-center justify-center focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed',
    s.border,
    s.radius,
    s.transition,
    sizeSquare[size],
    t.text,
    t.border,
    t.bg,
    t.hover,
    focusRing,
    t.ring,
    !disabled && c.shadow,
    !disabled && c.shadowHover,
    !disabled && c.shadowActive,
  );
}

/** The box that centres the icon. */
export const iconButtonIconClasses = 'inline-flex items-center justify-center shrink-0 leading-none';
