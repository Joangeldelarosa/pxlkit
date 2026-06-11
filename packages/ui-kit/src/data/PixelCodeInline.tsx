import React from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelCodeInline — inline <code> with tone tinting.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelCodeInlineProps {
  /** Code content. */
  children: React.ReactNode;
  /** Tone tint. Defaults to `'cyan'`. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
}

export function PixelCodeInline({
  children,
  tone = 'cyan',
  surface: surfaceProp,
}: PixelCodeInlineProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <code className={cn('px-1.5 py-0.5 text-xs', s.border, s.radius, s.font, toneMap[tone].border, toneMap[tone].soft, toneMap[tone].text)}>
      {children}
    </code>
  );
}
