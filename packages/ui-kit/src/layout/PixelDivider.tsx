'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelDivider — horizontal rule with optional label.
   Pixel surface adds dotted line + diamond ornaments around the label.
   Decorative (non-interactive); does not forward refs.
   ───────────────────────────────────────────────────────────────────────── */

import React from 'react';
import { cn, Surface, Tone, surfaceClasses, toneMap, useEffectiveSurface } from '../common';

export interface PixelDividerProps {
  /** Optional centered label between two rules. */
  label?: string;
  /** Color tone of the label text. */
  tone?: Tone;
  /** Symmetric vertical padding. */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
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
  const s = surfaceClasses(surface);
  const spacingClass = spacing === 'lg' ? 'py-10' : spacing === 'md' ? 'py-6' : spacing === 'sm' ? 'py-3' : '';
  const rule = surface === 'pixel' ? 'border-t-2 border-dotted' : 'border-t';

  if (!label) {
    return <hr className={cn(rule, 'border-retro-border/40', spacingClass, className)} />;
  }
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={label}
      className={cn('flex items-center gap-3', spacingClass, className)}
    >
      <hr aria-hidden="true" className={cn(rule, 'flex-1 border-retro-border/40')} />
      <span className={cn('text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5', surface === 'pixel' ? 'font-pixel' : s.fontDisplay, toneMap[tone].text)}>
        {surface === 'pixel' && <span aria-hidden className="opacity-60">◆</span>}
        {label}
        {surface === 'pixel' && <span aria-hidden className="opacity-60">◆</span>}
      </span>
      <hr aria-hidden="true" className={cn(rule, 'flex-1 border-retro-border/40')} />
    </div>
  );
}
