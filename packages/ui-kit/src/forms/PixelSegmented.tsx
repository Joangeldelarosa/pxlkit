/* ─────────────────────────────────────────────────────────────────────────
   PixelSegmented — segmented control for toggling between options.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import {
  Tone, Surface, Option, cn,
  toneMap, focusRing, surfaceClasses, useEffectiveSurface,
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
  const s = surfaceClasses(surface);
  const groupName = ariaLabel || label || undefined;
  return (
    <div ref={ref} className={cn('space-y-1.5', disabled && 'opacity-50 cursor-not-allowed')}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      {label && <p className={cn('text-xs text-retro-muted', s.font)}>{label}</p>}
      <div
        role={groupName ? 'group' : undefined}
        aria-label={groupName}
        className={cn('inline-flex max-w-full overflow-x-auto bg-retro-surface/50 p-0.5', s.border, s.radius, 'border-retro-border-strong/60')}
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
              className={cn(
                'px-3 py-1.5 text-xs outline-none whitespace-nowrap',
                s.font, s.radius, s.transition,
                focusRing, toneMap[tone].ring,
                isActive
                  ? cn(toneMap[tone].bg, toneMap[tone].text, 'border border-transparent shadow-sm')
                  : 'border border-transparent text-retro-muted hover:text-retro-text',
                disabled && 'cursor-not-allowed',
              )}
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
