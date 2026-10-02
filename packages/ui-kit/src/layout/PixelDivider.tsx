'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelDivider — horizontal rule with optional label.
   Pixel surface adds dotted line + diamond ornaments around the label.
   Decorative (non-interactive); does not forward refs.
   ───────────────────────────────────────────────────────────────────────── */

import React from 'react';
import { dividerClasses, type DividerSpacing } from '@pxlkit/ui-kit-core';
import { cn, Surface, Tone, useEffectiveSurface } from '../common';

export interface PixelDividerProps {
  /** Optional centered label between two rules. */
  label?: string;
  /** Color tone of the label text. */
  tone?: Tone;
  /** Symmetric vertical padding. */
  spacing?: DividerSpacing;
  className?: string;
  /** Surface variant. Falls back to nearest <PxlKitSurface>. */
  surface?: Surface;
}

export function PixelDivider({
  label,
  tone = 'neutral',
  spacing = 'none',
  className,
  surface: surfaceProp,
}: PixelDividerProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const c = dividerClasses(surface, spacing, tone);

  if (!label) {
    return <hr className={cn(c.rule, className)} />;
  }
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={label}
      className={cn(c.separator, className)}
    >
      <hr aria-hidden="true" className={c.line} />
      <span className={c.label}>
        {surface === 'pixel' && <span aria-hidden className="opacity-60">◆</span>}
        {label}
        {surface === 'pixel' && <span aria-hidden className="opacity-60">◆</span>}
      </span>
      <hr aria-hidden="true" className={c.line} />
    </div>
  );
}
