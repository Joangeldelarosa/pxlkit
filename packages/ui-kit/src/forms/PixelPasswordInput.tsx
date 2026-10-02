/* ─────────────────────────────────────────────────────────────────────────
   PixelPasswordInput — password field with show/hide toggle.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useId, useState } from 'react';
import { fieldDescribedBy, fieldMessageId, passwordInputClasses } from '@pxlkit/ui-kit-core';
import {
  Tone, Size, Surface, cn,
  useEffectiveSurface,
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
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const c = passwordInputClasses(surface, { tone, size, invalid: !!error });
  const [visible, setVisible] = useState(false);
  const reactId = useId();
  const inputId = rest.id ?? `pxl-password-${reactId}`;
  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={inputId} messageId={fieldMessageId(inputId)}>
      <span className={c.shell}>
        <input
          id={inputId}
          ref={ref}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(inputId, { hint, error }, ariaDescribedBy)}
          className={cn(c.input, className)}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? toggleLabels[1] : toggleLabels[0]}
          aria-pressed={visible}
          className={c.toggle}
          disabled={rest.disabled}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? toggleLabels[1] : toggleLabels[0]}
        </button>
      </span>
    </FieldShell>
  );
});
