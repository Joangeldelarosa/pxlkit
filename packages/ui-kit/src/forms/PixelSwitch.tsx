/* ─────────────────────────────────────────────────────────────────────────
   PixelSwitch — toggle switch with disabled + surface.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import {
  Tone, Surface, cn,
  toneMap, focusRing, surfaceClasses, useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

/** Public prop bag for {@link PixelSwitch}. */
export interface PixelSwitchProps {
  /** Label rendered next to the switch. */
  label: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fires with the next checked value when clicked. */
  onChange?: (next: boolean) => void;
  /** Disables interaction + grays out the control. */
  disabled?: boolean;
  /** Visual tone for the "on" state. Default: `'green'`. */
  tone?: Tone;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
  surface?: Surface;
  /** Form-serialization name. Hidden mirror sends `'on'` / `''`. */
  name?: string;
  /** HTML form value when checked. Defaults to `'on'`. */
  value?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** DOM `id` forwarded to the trigger. */
  id?: string;
}

export const PixelSwitch = forwardRef<HTMLButtonElement, PixelSwitchProps>(function PixelSwitch(
  {
    label, checked, defaultChecked, onChange,
    disabled = false,
    tone = 'green',
    surface: surfaceProp,
    name, value = 'on', required, id,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [internalChecked, setInternalChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange,
  });
  const isChecked = internalChecked ?? false;
  return (
    <>
      {name && isChecked && <input type="hidden" name={name} value={value} required={required} />}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => !disabled && setInternalChecked(!isChecked)}
        className={cn(
          'group inline-flex items-center gap-3 text-sm text-retro-text outline-none',
          s.font, focusRing, toneMap[tone].ring,
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center transition-colors',
            s.border,
            surface === 'pixel' ? 'rounded-[3px]' : 'rounded-full',
            isChecked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border-strong bg-retro-surface',
          )}
        >
          <span
            className={cn(
              'absolute left-0.5 h-4 w-4 transition-transform',
              surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
              isChecked ? cn('translate-x-5', toneMap[tone].fill) : 'translate-x-0 bg-retro-muted',
            )}
          />
        </span>
        <span className="select-none">{label}</span>
      </button>
    </>
  );
});
