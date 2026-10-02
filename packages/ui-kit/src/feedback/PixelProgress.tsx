import React, { forwardRef } from 'react';
import {
  PROGRESS_DEFAULT_LABEL,
  clampProgress,
  progressClasses,
  progressFillWidth,
  progressSegmentClasses,
} from '@pxlkit/ui-kit-core';
import { Tone, Surface, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelProgress — Pixel surface renders 10 segmented HP-bar blocks; linear
   surface renders a smooth filled bar.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelProgress}. */
export interface PixelProgressProps {
  /** Current value 0-100 (clamped). */
  value: number;
  /** Tone determines fill color. Defaults to `'green'`. */
  tone?: Tone;
  /**
   * Optional label rendered above the bar. Also used as the progressbar's
   * accessible name; falls back to "Progress" when omitted.
   */
  label?: string;
  /** Whether to show the numeric percentage on the right. Defaults to `true`. */
  showValue?: boolean;
  /** Surface override; falls back to nearest provider. */
  surface?: Surface;
  /** When `true`, switches to indeterminate animation (visual only — ARIA still reports value). */
  indeterminate?: boolean;
}

export const PixelProgress = forwardRef<HTMLDivElement, PixelProgressProps>(function PixelProgress(
  { value, tone = 'green', label, showValue = true, surface: surfaceProp, indeterminate = false },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const classes = progressClasses(surface, tone, { indeterminate });
  const safe = clampProgress(value);
  const aria = {
    role: 'progressbar',
    'aria-valuenow': indeterminate ? undefined : safe,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-label': label ?? PROGRESS_DEFAULT_LABEL,
    'aria-busy': indeterminate || undefined,
  } as const;

  return (
    <div ref={ref} className={classes.root}>
      {(label || showValue) && (
        <div className={classes.header}>
          {label && <span>{label}</span>}
          {showValue && !indeterminate && <span className={classes.value}>{safe}%</span>}
        </div>
      )}
      {surface === 'pixel' ? (
        <div {...aria} className={classes.track}>
          {progressSegmentClasses(value, tone, { indeterminate }).map((segment, i) => (
            <div key={i} className={segment} />
          ))}
        </div>
      ) : (
        <div {...aria} className={classes.track}>
          <div className={classes.fill} style={{ width: progressFillWidth(value, { indeterminate }) }} />
        </div>
      )}
    </div>
  );
});

PixelProgress.displayName = 'PixelProgress';
