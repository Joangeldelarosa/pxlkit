'use client';

import React, { forwardRef } from 'react';
import { SPINNER_DEFAULT_LABEL, spinnerAnimation, spinnerClasses, type SpinnerSize } from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface PixelSpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
  surface?: Surface;
  tone?: ToneKey;
  /**
   * When `true`, renders as pure decoration (aria-hidden, no role, no label).
   * Use inside an already-announcing parent (e.g. a `<button loading>` that
   * declares `aria-busy="true"`) to avoid double announcements.
   *
   * NOTE: when using PixelSpinner as a standalone loading indicator (not
   * decorative), the consumer MUST set `aria-busy="true"` on the loading
   * container per WAI-ARIA — the spinner alone isn't enough context.
   */
  decorative?: boolean;
}

export const PixelSpinner = forwardRef<HTMLSpanElement, PixelSpinnerProps>(function PixelSpinner(
  { size = 'md', label = SPINNER_DEFAULT_LABEL, surface: surfaceProp, tone = 'cyan', decorative = false, className, ...rest },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const reducedMotion = useReducedMotion();
  const animation = spinnerAnimation(surface, { reducedMotion });
  const classes = spinnerClasses(surface, size, tone);

  // role=status already implies aria-live=polite per WAI-ARIA. No need to
  // declare it twice — assistive tech treats the polite default identically.
  const liveAttrs: React.HTMLAttributes<HTMLSpanElement> = decorative
    ? { 'aria-hidden': true }
    : { role: 'status', 'aria-label': label };

  return (
    <span ref={ref} {...liveAttrs} className={cn(classes.root, className)} {...rest}>
      <span data-pxl-spinner-blade aria-hidden className={classes.blade} style={animation ? { animation } : undefined} />
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  );
});

PixelSpinner.displayName = 'PixelSpinner';
