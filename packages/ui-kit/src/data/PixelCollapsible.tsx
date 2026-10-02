import React, { useId, useState } from 'react';
import { collapsibleClasses, collapsibleIds } from '@pxlkit/ui-kit-core';
import {
  Tone, Surface,
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
  const [open, setOpen] = useState(defaultOpen);
  const classes = collapsibleClasses(surface, { bordered, open });
  /* Stable trigger/content ids for the disclosure aria wiring — same
     pattern as PixelAccordion (aria-expanded + aria-controls on the
     trigger, aria-labelledby back-reference on the content region). */
  const baseId = useId();
  const { trigger: triggerId, content: contentId } = collapsibleIds(baseId);
  return (
    <div className={classes.root}>
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
        iconRight={<ChevronDownIcon className={classes.chevron} />}
        className={classes.trigger}
      >
        {label}
      </PixelButton>
      {open && (
        <div id={contentId} aria-labelledby={triggerId} className={classes.content}>
          {children}
        </div>
      )}
    </div>
  );
}
