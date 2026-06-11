import React from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
} from '../common';

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
  const s = surfaceClasses(surface);
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center px-1.5 text-[10px] text-retro-muted',
        s.border, s.radius, s.font,
        'border-retro-border bg-retro-surface',
        surface === 'pixel'
          ? 'shadow-[0_2px_0_0_rgba(0,0,0,0.25)]'
          : 'shadow-[0_1px_0_0_rgba(0,0,0,0.15)]',
      )}
    >
      {children}
    </kbd>
  );
}
