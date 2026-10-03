import React, { forwardRef } from 'react';
import { iconButtonClasses, iconButtonIconClasses } from '@pxlkit/ui-kit-core';
import { Tone, Size, Surface, cn, useEffectiveSurface } from '../common';

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
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(iconButtonClasses(surface, { tone, size, disabled: !!rest.disabled }), className)}
      {...rest}
    >
      <span className={iconButtonIconClasses}>{icon}</span>
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
