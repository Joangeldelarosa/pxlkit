import React from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelColorSwatch — design token preview with CSS var label.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelColorSwatchProps {
  /** Display name for the token (e.g. "Cyan 500"). */
  name: string;
  /** CSS variable to preview (e.g. "--retro-cyan"). */
  cssVar: string;
  /** Visual surface override. */
  surface?: Surface;
}

export function PixelColorSwatch({
  name,
  cssVar,
  surface: surfaceProp,
}: PixelColorSwatchProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn('h-8 w-8', s.border, s.radius, 'border-retro-border/50')}
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <p className={cn('text-xs text-retro-text', s.font)}>{name}</p>
        <p className={cn('text-[10px] text-retro-muted', s.font)}>{cssVar}</p>
      </div>
    </div>
  );
}
