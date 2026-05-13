import React from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from './common';

/* ──────────────────────────────────────────────────────────────────────────
   PixelAlert — banner with tone + icon + action.
   Pixel surface adds a left accent stripe (RPG status-bar pattern).
   ────────────────────────────────────────────────────────────────────────── */

export function PixelAlert({
  title,
  message,
  tone = 'red',
  icon,
  action,
  surface: surfaceProp,
}: {
  title: string;
  message: string;
  tone?: Tone;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div
      role="alert"
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
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelProgress — Pixel surface renders 10 segmented HP-bar blocks;
   linear surface renders a smooth filled bar.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelProgress({
  value,
  tone = 'green',
  label,
  showValue = true,
  surface: surfaceProp,
}: {
  value: number;
  tone?: Tone;
  label?: string;
  showValue?: boolean;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className={cn('flex items-center justify-between text-xs text-retro-muted', s.font)}>
          {label && <span>{label}</span>}
          {showValue && <span className={toneMap[tone].text}>{safe}%</span>}
        </div>
      )}
      {surface === 'pixel' ? (
        <div
          role="progressbar"
          aria-valuenow={safe}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
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
                  filled ? toneMap[tone].fill : partial ? cn(toneMap[tone].fill, 'opacity-50') : 'bg-retro-bg/40',
                )}
              />
            );
          })}
        </div>
      ) : (
        <div
          role="progressbar"
          aria-valuenow={safe}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className="h-2.5 overflow-hidden rounded-full border border-retro-border bg-retro-surface/80"
        >
          <div
            className={cn('h-full rounded-full transition-all duration-500', toneMap[tone].bg)}
            style={{ width: `${safe}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelSkeleton — loading placeholder. Pixel surface uses sharp corners.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelSkeleton({
  width,
  height = '1rem',
  rounded = false,
  className,
  surface: surfaceProp,
}: {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const roundClass = rounded ? (surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full') : s.radius;
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('animate-pulse bg-retro-surface/80', roundClass, className)}
      style={{ width, height }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelEmptyState — empty/no-results placeholder.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelEmptyState({
  title,
  description,
  action,
  icon,
  surface: surfaceProp,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className={cn('border-dashed border-retro-border/60 bg-retro-surface/20 p-8 text-center', s.border, s.radiusLg)}>
      {icon && <div className="mb-3 flex items-center justify-center text-retro-cyan">{icon}</div>}
      <h4 className={cn('text-sm font-semibold text-retro-text', s.font)}>{title}</h4>
      <p className="mx-auto mt-2 max-w-sm text-sm text-retro-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
