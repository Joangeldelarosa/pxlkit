import React, { forwardRef } from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from './common';

/* ──────────────────────────────────────────────────────────────────────────
   PixelAlert — banner with tone + icon + action.
   Pixel surface adds a left accent stripe (RPG status-bar pattern).
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelAlert}. */
export interface PixelAlertProps {
  title: string;
  message: string;
  tone?: Tone;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  surface?: Surface;
  /** Optional `aria-live` override. Status banners ("info") should usually use `"polite"`. */
  live?: 'polite' | 'assertive' | 'off';
}

export const PixelAlert = forwardRef<HTMLDivElement, PixelAlertProps>(function PixelAlert(
  { title, message, tone = 'red', icon, action, surface: surfaceProp, live },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  // Critical tones get assertive announcements by default; neutral tones go polite.
  const ariaLive = live ?? (tone === 'red' || tone === 'gold' ? 'assertive' : 'polite');
  return (
    <div
      ref={ref}
      role="alert"
      aria-live={ariaLive}
      className={cn(
        'relative p-3',
        s.border, s.radiusLg,
        toneMap[tone].border,
        toneMap[tone].soft,
        surface === 'pixel' && 'pl-4',
      )}
    >
      {surface === 'pixel' && (
        <span aria-hidden className={cn('absolute left-0 top-0 bottom-0 w-1', toneMap[tone].fill)} />
      )}
      <div className="flex items-start gap-2.5">
        {icon && <span className={cn('mt-0.5 shrink-0 inline-flex items-center justify-center', toneMap[tone].text)}>{icon}</span>}
        <div className="flex-1">
          <p className={cn('text-xs font-semibold', s.font, toneMap[tone].text)}>{title}</p>
          <p className="mt-1 text-sm text-retro-muted">{message}</p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelProgress — Pixel surface renders 10 segmented HP-bar blocks;
   linear surface renders a smooth filled bar.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelProgress}. */
export interface PixelProgressProps {
  value: number;
  tone?: Tone;
  label?: string;
  showValue?: boolean;
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
          aria-label={label}
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
          aria-label={label}
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

/* ──────────────────────────────────────────────────────────────────────────
   PixelSkeleton — loading placeholder. Pixel surface uses sharp corners.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSkeleton}. */
export interface PixelSkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-label'> {
  width?: string;
  height?: string;
  rounded?: boolean;
  surface?: Surface;
  /** Accessible label override; falls back to `"Loading"`. */
  ariaLabel?: string;
}

export const PixelSkeleton = forwardRef<HTMLDivElement, PixelSkeletonProps>(function PixelSkeleton(
  { width, height = '1rem', rounded = false, className, surface: surfaceProp, ariaLabel = 'Loading', style, ...rest },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const roundClass = rounded ? (surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full') : s.radius;
  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      className={cn('animate-pulse bg-retro-surface/80', roundClass, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelEmptyState — empty/no-results placeholder.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelEmptyState}. */
export interface PixelEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  surface?: Surface;
}

export const PixelEmptyState = forwardRef<HTMLDivElement, PixelEmptyStateProps>(function PixelEmptyState(
  { title, description, action, icon, surface: surfaceProp },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div ref={ref} className={cn('border-dashed border-retro-border/60 bg-retro-surface/20 p-8 text-center', s.border, s.radiusLg)}>
      {icon && <div className="mb-3 flex items-center justify-center text-retro-cyan" aria-hidden>{icon}</div>}
      <h4 className={cn('text-sm font-semibold text-retro-text', s.font)}>{title}</h4>
      <p className="mx-auto mt-2 max-w-sm text-sm text-retro-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
});
