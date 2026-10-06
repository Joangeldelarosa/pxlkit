import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  TOAST_DISMISS_LABEL,
  createToastCountdown,
  holdToastCountdown,
  resetToastCountdown,
  startToastCountdown,
  toastClasses,
  toastCountdownDelay,
  toastCountdownStyle,
  toastDuration,
  toastLeading,
  toastTone,
  type ToastHolds,
} from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface, CloseIcon } from '../common';
import { useEventListener } from '../hooks/useEventListener';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
// Type-only import (erased at runtime): PxlKitToastProvider.tsx value-imports
// PixelToast back, so keeping this edge type-only avoids a runtime cycle.
import type { ToastItem } from './PxlKitToastProvider';

/* ──────────────────────────────────────────────────────────────────────────
   PixelToast — individual toast card.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for the individual {@link PixelToast} card. Usually used
 *  through {@link useToast}, but exported for advanced custom rendering. */
export interface PixelToastProps {
  /** The toast to show. */
  toast: ToastItem;
  /** Called when the dismiss button is pressed, or the countdown runs out. */
  onDismiss: () => void;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

export const PixelToast = forwardRef<HTMLDivElement, PixelToastProps>(function PixelToast(
  { toast, onDismiss, surface: surfaceProp },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const tone = toastTone(toast);
  const classes = toastClasses(surface, tone);
  const duration = toastDuration(toast);
  const leading = toastLeading(toast);

  // Keep the latest onDismiss in a ref so re-rendered ToastViewport children
  // (e.g. another toast pushed mid-duration) don't reset the auto-dismiss timer.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; }, [onDismiss]);

  const [countdown, setCountdown] = useState(() => createToastCountdown(duration));
  const bar = useRef<HTMLDivElement>(null);

  // Count down afresh when the toast changes its duration (e.g. promise
  // resolved → loading→success patch flips duration 0→4500).
  useIsomorphicLayoutEffect(() => {
    setCountdown((current) => (current.duration === duration ? current : resetToastCountdown(current, duration)));
  }, [duration]);

  // Start once the full bar is on the page: reading its width commits that
  // style first, so the bar shrinks from full rather than starting empty.
  useIsomorphicLayoutEffect(() => {
    if (countdown.startedAt !== null) return;
    void bar.current?.offsetWidth;
    setCountdown((current) => startToastCountdown(current, Date.now()));
  }, [countdown]);

  useEffect(() => {
    const delay = toastCountdownDelay(countdown, Date.now());
    if (delay === null) return;
    const timeout = setTimeout(() => onDismissRef.current(), delay);
    return () => clearTimeout(timeout);
  }, [countdown]);

  // The pointer over the card or focus inside it holds the countdown, until
  // both have left. Focus is re-read when the pointer leaves: a focused
  // element removed from the page takes focus away and need not fire a blur.
  const hold = (holds: Partial<ToastHolds>) =>
    setCountdown((current) => holdToastCountdown(current, holds, Date.now()));

  // A page nobody looks at — hidden, or in a window in the background —
  // holds the countdown too.
  useEventListener(
    'visibilitychange',
    () => hold({ hidden: document.hidden }),
    typeof document !== 'undefined' ? document : null,
  );
  useEventListener('blur', () => hold({ blurred: true }));
  useEventListener('focus', () => hold({ blurred: false }));

  // The provider announces the toast in its live regions: the card is no live
  // region of its own, which would be read unreliably as it is inserted.
  return (
    <div
      ref={ref}
      data-pxl-toast
      data-tone={tone}
      data-loading={toast.loading ? 'true' : 'false'}
      onMouseEnter={() => hold({ hover: true })}
      onMouseLeave={(event) => hold({ hover: false, focus: event.currentTarget.contains(document.activeElement) })}
      onFocus={() => hold({ focus: true })}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hold({ focus: false });
      }}
      className={classes.root}
    >
      <div className={classes.row}>
        {surface === 'pixel' && <span aria-hidden className={classes.stripe} />}
        {leading && (
          <span data-pxl-toast-leading className={classes.leading} aria-hidden>
            {leading.kind === 'spinner' ? <span role="presentation" aria-hidden className={classes.spinner} /> : leading.node}
          </span>
        )}
        <div className={classes.body}>
          <p className={classes.title}>{toast.title}</p>
          {toast.message && <p className={classes.message}>{toast.message}</p>}
          {toast.action && <div className={classes.action}>{toast.action}</div>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={TOAST_DISMISS_LABEL}
          data-pxl-toast-dismiss
          className={classes.dismiss}
        >
          <CloseIcon />
        </button>
      </div>
      {countdown.duration > 0 && (
        <div className={classes.track} aria-hidden>
          <div ref={bar} className={classes.bar} style={toastCountdownStyle(countdown)} />
        </div>
      )}
    </div>
  );
});
