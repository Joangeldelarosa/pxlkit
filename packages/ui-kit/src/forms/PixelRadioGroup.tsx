/* ─────────────────────────────────────────────────────────────────────────
   PixelRadioGroup — grouped radios with pixel dot indicator.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { radioGroupClasses, radioIndicatorClasses } from '@pxlkit/ui-kit-core';
import {
  Tone, Surface, Option,
  useEffectiveSurface,
} from '../common';

/** Public prop bag for {@link PixelRadioGroup}. */
export interface PixelRadioGroupProps {
  /** Legend rendered above the group. */
  label: string;
  /** Currently-selected option value. */
  value: string;
  /** Radio items. */
  options: Option[];
  /** Fires with the new value when the user picks a radio. */
  onChange: (next: string) => void;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Visual tone for the selected radio. Default: `'cyan'`. */
  tone?: Tone;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
  surface?: Surface;
  /** Form-serialization name. */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
}

export const PixelRadioGroup = forwardRef<HTMLFieldSetElement, PixelRadioGroupProps>(function PixelRadioGroup(
  {
    label, value, options, onChange,
    disabled = false,
    tone = 'cyan',
    surface: surfaceProp,
    name, required,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const c = radioGroupClasses(surface, disabled);
  return (
    <fieldset ref={ref} className={c.group} role="radiogroup" aria-disabled={disabled} aria-required={required || undefined}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <legend className={c.legend}>{label}</legend>
      {options.map((opt) => {
        const isActive = value === opt.value;
        const radio = radioIndicatorClasses(surface, { tone, checked: isActive, disabled });
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-disabled={disabled}
            // Fix: <fieldset disabled> only cascades to native form controls;
            // <button> children need an explicit `disabled` to be functionally
            // unavailable (not just visually dim).
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            className={c.radio}
          >
            <span className={radio.indicator}>
              {isActive && <span className={radio.dot} />}
            </span>
            <span className={c.label}>{opt.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
});
