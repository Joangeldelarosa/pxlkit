/* ─────────────────────────────────────────────────────────────────────────
   PixelSegmented — segmented control for toggling between options.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { segmentClasses, segmentedClasses, segmentedGroupName } from '@pxlkit/ui-kit-core';
import {
  Tone, Surface, Option,
  useEffectiveSurface,
} from '../common';

/** Public prop bag for {@link PixelSegmented}. */
export interface PixelSegmentedProps {
  /** Caption rendered above the segmented control. Omitted when empty. */
  label?: string;
  /** Active option value. */
  value: string;
  /** Segment items. */
  options: Option[];
  /** Fires with the new value when a segment is clicked. */
  onChange: (next: string) => void;
  /** Disables every segment. */
  disabled?: boolean;
  /** Visual tone for the active segment. Default: `'green'`. */
  tone?: Tone;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
  surface?: Surface;
  /** Form-serialization name. */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** Accessible name for the group; use it when no visible `label` is rendered. */
  'aria-label'?: string;
}

export const PixelSegmented = forwardRef<HTMLDivElement, PixelSegmentedProps>(function PixelSegmented(
  {
    label, value, options, onChange,
    disabled = false,
    tone = 'green',
    surface: surfaceProp,
    name, required,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const c = segmentedClasses(surface, disabled);
  const groupName = segmentedGroupName(ariaLabel, label);
  return (
    <div ref={ref} className={c.root}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      {label && <p className={c.label}>{label}</p>}
      <div
        role={groupName ? 'group' : undefined}
        aria-label={groupName}
        className={c.track}
      >
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isActive}
              aria-disabled={disabled}
              disabled={disabled}
              className={segmentClasses(surface, { tone, active: isActive, disabled })}
              onClick={() => !disabled && onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
