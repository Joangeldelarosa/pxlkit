import React from 'react';
import { codeInlineClasses } from '@pxlkit/ui-kit-core';
import { Tone, Surface, useEffectiveSurface } from '../common';

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
  return (
    <code className={codeInlineClasses(surface, tone)}>
      {children}
    </code>
  );
}
