import React from 'react';
import { kbdClasses } from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelKbd — styled keyboard shortcut indicator.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelKbdProps {
  /** Key label (e.g. "⌘", "K", "Esc"). */
  children: React.ReactNode;
  /** Visual surface override. */
  surface?: Surface;
}

export function PixelKbd({
  children,
  surface: surfaceProp,
}: PixelKbdProps) {
  const surface = useEffectiveSurface(surfaceProp);
  return (
    <kbd className={kbdClasses(surface)}>
      {children}
    </kbd>
  );
}
