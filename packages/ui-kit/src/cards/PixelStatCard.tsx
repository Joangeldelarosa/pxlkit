import React from 'react';
import {
  statCardClasses,
  type PixelStatCardIconPosition,
  type PixelStatCardSize,
} from '@pxlkit/ui-kit-core';
import { Tone, Surface, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelStatCard — compact metric card.

   Upgraded (Ola 2) additively: optional `size` (sm/md/lg) scales padding +
   font sizes; optional `iconPosition` (left/right/top/bottom-left) controls
   where the icon renders. Defaults preserve the legacy layout.
   ───────────────────────────────────────────────────────────────────────── */

export type { PixelStatCardIconPosition, PixelStatCardSize } from '@pxlkit/ui-kit-core';

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
  /** Color the value with the tone color instead of the default text color. */
  valueTone?: boolean;
  /** Horizontal alignment of label/value/trend. Defaults to `'start'`. */
  align?: 'start' | 'center';
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
  valueTone = false,
  align = 'start',
  bordered = true,
}: PixelStatCardProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const classes = statCardClasses(surface, { tone, size, iconPosition, valueTone, align, bordered });

  const labelEl = <p className={classes.label}>{label}</p>;
  const valueEl = <p className={classes.value}>{value}</p>;
  const iconEl = icon ? <span className={classes.icon}>{icon}</span> : null;
  const trendEl = trend ? <p className={classes.trend}>{trend}</p> : null;

  if (iconPosition === 'right') {
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          {labelEl}
          <div className={classes.valueRow}>{valueEl}</div>
          {trendEl}
        </div>
        {iconEl}
      </div>
    );
  }

  if (iconPosition === 'left') {
    return (
      <div className={classes.root}>
        {iconEl}
        <div className={classes.content}>
          {labelEl}
          <div className={classes.valueRow}>{valueEl}</div>
          {trendEl}
        </div>
      </div>
    );
  }

  if (iconPosition === 'bottom-left') {
    return (
      <div className={classes.root}>
        <div className={classes.header}>{labelEl}</div>
        {valueEl}
        {trendEl}
        {iconEl && <span className={classes.cornerIcon}>{icon}</span>}
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {labelEl}
        {iconEl}
      </div>
      {valueEl}
      {trendEl}
    </div>
  );
}
