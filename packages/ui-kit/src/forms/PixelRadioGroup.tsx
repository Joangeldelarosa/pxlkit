/* ─────────────────────────────────────────────────────────────────────────
   PixelRadioGroup — grouped radios with pixel dot indicator.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import {
  Tone, Surface, Option, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
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
  const s = surfaceClasses(surface);
  return (
    <fieldset ref={ref} className="space-y-2" role="radiogroup" aria-disabled={disabled} aria-required={required || undefined}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <legend className={cn('mb-1.5 text-xs text-retro-muted', s.font)}>{label}</legend>
      {options.map((opt) => {
        const isActive = value === opt.value;
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
            className={cn(
              'group flex items-center gap-2.5 text-sm outline-none',
              s.font,
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
                s.border,
                surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
                isActive ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border-strong bg-retro-bg',
                !disabled && 'group-hover:border-retro-muted',
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    'block h-2 w-2',
                    surface === 'pixel' ? 'rounded-[1px]' : 'rounded-full',
                    toneMap[tone].fill,
                  )}
                />
              )}
            </span>
            <span className="text-retro-text select-none">{opt.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
});
