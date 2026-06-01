'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

const linearBorderMap: Record<SpinnerSize, string> = {
  xs: 'border',
  sm: 'border',
  md: 'border-2',
  lg: 'border-2',
};

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
  { size = 'md', label = 'Loading', surface: surfaceProp, tone = 'cyan', decorative = false, className, ...rest },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const reduced = useReducedMotion();
  const t = toneTokens[tone];

  const animationStyle: React.CSSProperties | undefined = reduced
    ? undefined
    : surface === 'pixel'
      ? { animation: 'pxl-spinner-steps 0.8s steps(8) infinite' }
      : { animation: 'pxl-spinner-smooth 0.6s linear infinite' };

  // role=status already implies aria-live=polite per WAI-ARIA. No need to
  // declare it twice — assistive tech treats the polite default identically.
  const liveAttrs: React.HTMLAttributes<HTMLSpanElement> = decorative
    ? { 'aria-hidden': true }
    : { role: 'status', 'aria-label': label };

  return (
    <span
      ref={ref}
      {...liveAttrs}
      className={cn(
        'relative inline-flex items-center justify-center align-middle',
        sizeMap[size],
        t.text,
        className,
      )}
      {...rest}
    >
      {surface === 'pixel' ? (
        <span
          data-pxl-spinner-blade
          aria-hidden
          className={cn(
            'block h-full w-full border-2 border-retro-border/40 border-t-current border-l-current',
            t.text,
          )}
          style={animationStyle}
        />
      ) : (
        <span
          data-pxl-spinner-blade
          aria-hidden
          className={cn(
            'block h-full w-full rounded-full',
            linearBorderMap[size],
            'border-retro-border/40 border-t-current',
            t.text,
          )}
          style={animationStyle}
        />
      )}
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  );
});

PixelSpinner.displayName = 'PixelSpinner';
