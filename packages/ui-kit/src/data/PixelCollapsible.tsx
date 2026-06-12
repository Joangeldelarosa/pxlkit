import React, { useId, useState } from 'react';
import {
  Tone, Surface, cn,
  surfaceClasses, useEffectiveSurface,
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
  /** Render with surface-aware border + radius chrome. Defaults to false (no chrome). */
  bordered?: boolean;
}

export function PixelCollapsible({
  label,
  children,
  defaultOpen = false,
  tone = 'neutral',
  surface: surfaceProp,
  bordered = false,
}: PixelCollapsibleProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [open, setOpen] = useState(defaultOpen);
  /* Stable trigger/content ids for the disclosure aria wiring — same
     pattern as PixelAccordion (aria-expanded + aria-controls on the
     trigger, aria-labelledby back-reference on the content region). */
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  return (
    <div className={cn(bordered && s.border, bordered && s.radius)}>
      <PixelButton
        id={triggerId}
        type="button"
        size="sm"
        tone={tone}
        surface={surface}
        variant="ghost"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        iconRight={<ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />}
        className="h-auto px-1.5 py-0.5 text-xs"
      >
        {label}
      </PixelButton>
      {open && (
        <div id={contentId} aria-labelledby={triggerId} className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
}
