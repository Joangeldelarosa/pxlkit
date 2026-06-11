import React, { forwardRef } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, sizeSquare, focusRing, surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelIconButton — square icon-only button with required `label` for
   screen readers. Accessible via `aria-label` + `title`.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelIconButton}. */
export interface PixelIconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible label — set as `aria-label` and `title`. Required. */
  label: string;
  /** Color tone (maps to `toneMap`). */
  tone?: Tone;
  /** Visual size (`xs`–`xl`); produces a square via `sizeSquare`. */
  size?: Size;
  /** Surface aesthetic override; defaults to nearest provider. */
  surface?: Surface;
  /** The icon to render inside the square. */
  icon: React.ReactNode;
}

export const PixelIconButton = forwardRef<HTMLButtonElement, PixelIconButtonProps>(function PixelIconButton(
  {
    label,
    tone = 'cyan',
    size = 'md',
    surface: surfaceProp,
    icon,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        s.border, s.radius, s.transition,
        sizeSquare[size],
        t.text, t.border, t.bg, t.hover,
        focusRing, t.ring,
        !rest.disabled && s.shadow, !rest.disabled && s.shadowHover, !rest.disabled && s.shadowActive,
        className,
      )}
      {...rest}
    >
      <span className="inline-flex items-center justify-center shrink-0 leading-none">{icon}</span>
    </button>
  );
});

PixelIconButton.displayName = 'PixelIconButton';

/**
 * @deprecated Renamed to {@link PixelIconButton}. The `PxlKit*` prefix is
 * reserved for system primitives (`PxlKitSurfaceProvider`,
 * `PxlKitLocaleProvider`); leaf components use `Pixel*`. Removal target:
 * 3.0.0 (carried forward from 2.0.0 — see ADR-0004).
 */
export const PxlKitButton = PixelIconButton;
/** @deprecated Renamed to {@link PixelIconButtonProps}. Removal target: 3.0.0 (see ADR-0004). */
export type PxlKitButtonProps = PixelIconButtonProps;
