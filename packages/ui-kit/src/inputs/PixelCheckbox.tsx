/* ─────────────────────────────────────────────────────────────────────────
   PixelCheckbox — chunky pixel check mark.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
  CheckIcon,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

/** Public prop bag for {@link PixelCheckbox}. */
export interface PixelCheckboxProps {
  /** Label rendered next to the box. */
  label: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fires with the next checked value when clicked. */
  onChange?: (next: boolean) => void;
  /** Disables interaction + grays out the control. */
  disabled?: boolean;
  /** Visual tone for the checked state. Default: `'green'`. */
  tone?: Tone;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
  surface?: Surface;
  /** Form-serialization name. Hidden mirror input sends `'on'` / `''`. */
  name?: string;
  /** HTML form value when checked. Defaults to `'on'`. */
  value?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** DOM `id` forwarded to the trigger. */
  id?: string;
}

export const PixelCheckbox = forwardRef<HTMLButtonElement, PixelCheckboxProps>(function PixelCheckbox(
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
        role="checkbox"
        aria-checked={isChecked}
        aria-disabled={disabled}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => setInternalChecked(!isChecked)}
        className={cn(
          'group flex items-center gap-2.5 text-sm outline-none',
          s.font,
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <span
          className={cn(
            'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
            s.border, s.radius,
            isChecked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border-strong bg-retro-bg',
            !disabled && 'group-hover:border-retro-muted',
            'group-focus-visible:ring-2 group-focus-visible:ring-retro-green/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg',
          )}
        >
          {isChecked && <CheckIcon className={toneMap[tone].text} />}
        </span>
        <span className="text-retro-text select-none">{label}</span>
      </button>
    </>
  );
});
