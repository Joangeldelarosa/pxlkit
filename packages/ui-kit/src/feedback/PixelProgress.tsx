import React, { forwardRef } from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';

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
  const s = surfaceClasses(surface);
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div ref={ref} className="space-y-1.5">
      {(label || showValue) && (
        <div className={cn('flex items-center justify-between text-xs text-retro-muted', s.font)}>
          {label && <span>{label}</span>}
          {showValue && !indeterminate && <span className={toneMap[tone].text}>{safe}%</span>}
        </div>
      )}
      {surface === 'pixel' ? (
        <div
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : safe}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? 'Progress'}
          aria-busy={indeterminate || undefined}
          className={cn('flex gap-0.5 p-0.5', s.border, s.radius, 'border-retro-border/60 bg-retro-surface/60')}
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = (i + 1) * 10 <= safe;
            const partial = !filled && i * 10 < safe;
            return (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-[1px] transition-all duration-150',
                  indeterminate
                    ? cn(toneMap[tone].fill, 'opacity-70 animate-pulse')
                    : filled
                      ? toneMap[tone].fill
                      : partial
                        ? cn(toneMap[tone].fill, 'opacity-50')
                        : 'bg-retro-bg/40',
                )}
              />
            );
          })}
        </div>
      ) : (
        <div
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : safe}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? 'Progress'}
          aria-busy={indeterminate || undefined}
          className="h-2.5 overflow-hidden rounded-full border border-retro-border bg-retro-surface/80"
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              toneMap[tone].bg,
              indeterminate && 'animate-pulse',
            )}
            style={{ width: indeterminate ? '100%' : `${safe}%` }}
          />
        </div>
      )}
    </div>
  );
});

PixelProgress.displayName = 'PixelProgress';
