import React from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelStatCard — compact metric card.

   Upgraded (Ola 2) additively: optional `size` (sm/md/lg) scales padding +
   font sizes; optional `iconPosition` (left/right/top/bottom-left) controls
   where the icon renders. Defaults preserve the legacy layout.
   ───────────────────────────────────────────────────────────────────────── */

export type PixelStatCardSize = 'sm' | 'md' | 'lg';
export type PixelStatCardIconPosition = 'left' | 'right' | 'top' | 'bottom-left';

export interface PixelStatCardProps {
  /** Caption rendered above the value. */
  label: string;
  /** Primary metric value. */
  value: string;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Tone tint for border, soft background, and icon color. */
  tone?: Tone;
  /** Optional trend/delta line rendered under the value. */
  trend?: string;
  /** Visual surface override. */
  surface?: Surface;
  /** Padding + typography scale. Defaults to `'md'`. */
  size?: PixelStatCardSize;
  /** Icon placement relative to label/value. Defaults to `'top'`. */
  iconPosition?: PixelStatCardIconPosition;
  /** Render with surface-aware border + radius chrome. Defaults to true — a stat card needs visible chrome. */
  bordered?: boolean;
}

export function PixelStatCard({
  label,
  value,
  icon,
  tone = 'gold',
  trend,
  surface: surfaceProp,
  size = 'md',
  iconPosition = 'top',
  bordered = true,
}: PixelStatCardProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const padding = size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4';
  const labelSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';
  const valueSize =
    surface === 'pixel'
      ? (size === 'sm' ? 'text-xs font-pixel' : size === 'lg' ? 'text-lg font-pixel' : 'text-sm font-pixel')
      : (size === 'sm' ? 'text-sm font-semibold' : size === 'lg' ? 'text-2xl font-semibold' : 'text-base font-semibold');
  const trendSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';
  const iconBoxSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
  const valueGap = size === 'sm' ? 'mt-1.5' : size === 'lg' ? 'mt-3' : 'mt-2';
  const trendGap = size === 'sm' ? 'mt-1.5' : size === 'lg' ? 'mt-3' : 'mt-2';

  const labelEl = <p className={cn(labelSize, 'text-retro-muted', s.font)}>{label}</p>;
  const valueEl = <p className={cn('text-retro-text', valueSize)}>{value}</p>;
  const iconEl = icon ? (
    <span className={cn('inline-flex items-center justify-center shrink-0', iconBoxSize, toneMap[tone].text)}>{icon}</span>
  ) : null;
  const trendEl = trend ? <p className={cn(trendGap, trendSize, 'text-retro-muted', s.font)}>{trend}</p> : null;

  const baseClass = cn(
    padding,
    bordered && s.border,
    bordered && s.radiusLg,
    bordered && toneMap[tone].border,
    bordered && toneMap[tone].soft,
  );

  if (iconPosition === 'right') {
    return (
      <div className={cn(baseClass, 'grid grid-cols-[1fr_auto] items-center gap-3')}>
        <div>
          {labelEl}
          <div className={valueGap}>{valueEl}</div>
          {trendEl}
        </div>
        {iconEl}
      </div>
    );
  }

  if (iconPosition === 'left') {
    return (
      <div className={cn(baseClass, 'flex items-center gap-3')}>
        {iconEl}
        <div className="flex-1">
          {labelEl}
          <div className={valueGap}>{valueEl}</div>
          {trendEl}
        </div>
      </div>
    );
  }

  if (iconPosition === 'bottom-left') {
    return (
      <div className={cn(baseClass, 'relative')}>
        <div className="mb-3 flex items-center justify-between">{labelEl}</div>
        {valueEl}
        {trendEl}
        {iconEl && (
          <span className={cn('absolute bottom-0 left-0 inline-flex items-center justify-center', padding, iconBoxSize, toneMap[tone].text)}>
            {icon}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={baseClass}>
      <div className="mb-3 flex items-center justify-between">
        {labelEl}
        {iconEl}
      </div>
      {valueEl}
      {trendEl}
    </div>
  );
}
