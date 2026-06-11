import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  Tone, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
  CloseIcon,
} from '../common';
// Type-only import (erased at runtime): PxlKitToastProvider.tsx value-imports
// PixelToast back, so keeping this edge type-only avoids a runtime cycle.
import type { ToastItem } from './PxlKitToastProvider';

/* ──────────────────────────────────────────────────────────────────────────
   PixelToast — individual toast card.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for the individual {@link PixelToast} card. Usually used
 *  through {@link useToast}, but exported for advanced custom rendering. */
export interface PixelToastProps {
  toast: ToastItem;
  onDismiss: () => void;
  surface?: Surface;
}

/** Tiny inline spinner used when `toast.loading === true`. Keeps PixelToast
 *  self-contained (no cross-module import from feedback.tsx). */
function ToastSpinner({ tone }: { tone: Tone }) {
  return (
    <span
      role="presentation"
      aria-hidden
      className={cn(
        'inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent',
        toneMap[tone].text,
      )}
    />
  );
}

export const PixelToast = forwardRef<HTMLDivElement, PixelToastProps>(function PixelToast(
  { toast, onDismiss, surface: surfaceProp },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const tone: Tone = toast.tone ?? 'cyan';
  const duration = toast.loading ? 0 : (toast.duration ?? 4500);
  const assertive = toast.assertive ?? (tone === 'red' || tone === 'gold');

  const [paused, setPaused] = useState(false);
  const start = useRef<number>(0);
  const remaining = useRef<number>(duration);

  // Keep the latest onDismiss in a ref so re-rendered ToastViewport children
  // (e.g. another toast pushed mid-duration) don't reset the auto-dismiss timer.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; }, [onDismiss]);

  // Reset the timer whenever the underlying toast changes its duration
  // (e.g. promise resolved → loading→success patch flips duration 0→4500).
  useEffect(() => {
    remaining.current = duration;
  }, [duration]);

  useEffect(() => {
    if (!duration) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (!paused) {
      start.current = Date.now();
      timeout = setTimeout(() => onDismissRef.current(), remaining.current);
    }
    return () => { if (timeout) clearTimeout(timeout); };
  }, [duration, paused]);

  const onMouseEnter = () => {
    if (!duration) return;
    remaining.current = Math.max(0, remaining.current - (Date.now() - start.current));
    setPaused(true);
  };
  const onMouseLeave = () => {
    if (!duration) return;
    setPaused(false);
  };

  const leadingIcon = toast.animatedIcon
    ?? (toast.loading ? <ToastSpinner tone={tone} /> : toast.icon);

  return (
    <div
      ref={ref}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-pxl-toast
      data-tone={tone}
      data-loading={toast.loading ? 'true' : 'false'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      className={cn(
        'pointer-events-auto relative w-full max-w-sm overflow-hidden bg-retro-bg shadow-xl',
        s.border, s.radiusLg,
        toneMap[tone].border,
        'animate-in fade-in slide-in-from-top-2 duration-200',
      )}
    >
      <div className={cn('flex items-start gap-2.5 p-3 pl-4', surface === 'pixel' && 'pl-5')}>
        {surface === 'pixel' && (
          <span aria-hidden className={cn('absolute left-0 top-0 bottom-0 w-1', toneMap[tone].fill)} />
        )}
        {leadingIcon && (
          <span
            data-pxl-toast-leading
            className={cn('mt-0.5 shrink-0 inline-flex items-center justify-center', toneMap[tone].text)}
            aria-hidden
          >
            {leadingIcon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-semibold truncate', s.font, toneMap[tone].text)}>{toast.title}</p>
          {toast.message && <p className="mt-1 text-sm text-retro-muted">{toast.message}</p>}
          {toast.action && <div className="mt-2.5">{toast.action}</div>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center text-retro-muted transition-colors hover:text-retro-text focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40"
        >
          <CloseIcon />
        </button>
      </div>
      {duration > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-retro-surface/40" aria-hidden>
          <div
            className={cn('h-full transition-[width] ease-linear', toneMap[tone].fill)}
            style={{
              width: paused ? `${(remaining.current / duration) * 100}%` : '0%',
              transitionDuration: paused ? '0ms' : `${remaining.current}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
});
