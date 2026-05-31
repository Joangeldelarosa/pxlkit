/* ─────────────────────────────────────────────────────────────────────────
   PixelPasswordInput — password field with show/hide toggle.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useState } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, focusRing, inputBase, sizeHeight, surfaceClasses, useEffectiveSurface,
  FieldShell,
} from '../common';

/** Public prop bag for {@link PixelPasswordInput}. */
export interface PixelPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Floating label rendered above the input shell. */
  label?: string;
  /** Helper text shown below the field. Hidden when `error` is set. */
  hint?: string;
  /** Error message shown below the field; flips visual state to invalid. */
  error?: string;
  /** Visual tone for focus ring + border emphasis. Default: `'neutral'`. */
  tone?: Tone;
  /** Field height token. Default: `'md'`. */
  size?: Size;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
  surface?: Surface;
  /** Text for the visibility toggle, in `[showLabel, hideLabel]` form. */
  toggleLabels?: [string, string];
}

export const PixelPasswordInput = forwardRef<HTMLInputElement, PixelPasswordInputProps>(function PixelPasswordInput(
  {
    label, hint, error,
    tone = 'neutral', size = 'md',
    surface: surfaceProp,
    toggleLabels = ['Show', 'Hide'],
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <span className="relative block">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          className={cn(
            inputBase, s.font, s.border, s.radius, s.transition,
            sizeHeight[size], focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border-strong',
            'px-3 pr-16',
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? toggleLabels[1] : toggleLabels[0]}
          aria-pressed={visible}
          className={cn(
            'absolute right-1.5 top-1/2 -translate-y-1/2 border border-retro-border-strong bg-retro-surface/60 px-2 py-0.5 text-[10px] uppercase text-retro-muted transition-colors hover:text-retro-text disabled:opacity-50 disabled:cursor-not-allowed',
            s.font, s.radius,
          )}
          disabled={rest.disabled}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? toggleLabels[1] : toggleLabels[0]}
        </button>
      </span>
    </FieldShell>
  );
});
