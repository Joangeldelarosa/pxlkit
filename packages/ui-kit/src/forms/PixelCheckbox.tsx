/* ─────────────────────────────────────────────────────────────────────────
   PixelCheckbox — chunky pixel check mark.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { checkboxClasses } from '@pxlkit/ui-kit-core';
import {
  Tone, Surface,
  useEffectiveSurface,
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
  const [internalChecked, setInternalChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange,
  });
  const isChecked = internalChecked ?? false;
  const c = checkboxClasses(surface, { tone, checked: isChecked, disabled });
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
        className={c.button}
      >
        <span className={c.box}>
          {isChecked && <CheckIcon className={c.check} />}
        </span>
        <span className={c.label}>{label}</span>
      </button>
    </>
  );
});
