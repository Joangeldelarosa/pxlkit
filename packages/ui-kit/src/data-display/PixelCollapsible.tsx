import React, { useState } from 'react';
import {
  Tone, Surface, cn,
  useEffectiveSurface,
  ChevronDownIcon,
} from '../common';
import { PixelButton } from '../actions';

/* ─────────────────────────────────────────────────────────────────────────
   PixelCollapsible — toggleable details block with a chevron header.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelCollapsibleProps {
  /** Trigger label. */
  label: string;
  /** Body content rendered when open. */
  children: React.ReactNode;
  /** Initial open state. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Tone tint for the trigger button. Defaults to `'neutral'`. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
}

export function PixelCollapsible({
  label,
  children,
  defaultOpen = false,
  tone = 'neutral',
  surface: surfaceProp,
}: PixelCollapsibleProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <PixelButton
        type="button"
        size="sm"
        tone={tone}
        surface={surface}
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        iconRight={<ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />}
        className="h-auto px-1.5 py-0.5 text-xs"
      >
        {label}
      </PixelButton>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
