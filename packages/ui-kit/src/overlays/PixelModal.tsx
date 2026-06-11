/* ─────────────────────────────────────────────────────────────────────────
   PixelModal — dialog with title bar (pixel surface = old-school window).
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
  CloseIcon,
} from '../common';
import { usePxlKitLocale } from '../locale';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { OverlayBackdrop } from './_internal/OverlayBackdrop';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { useEscape } from '../hooks/useEscape';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** Public prop bag for {@link PixelModal}. */
export interface PixelModalProps {
  /** Whether the modal is currently visible. */
  open: boolean;
  /** Modal title shown in the header. */
  title: string;
  /** Modal body content. */
  children: React.ReactNode;
  /** Called when the user requests to close the modal. */
  onClose: () => void;
  /** Width preset. Default `'md'`. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Visual surface override. Falls back to nearest `<PxlKitProvider>` surface. */
  surface?: Surface;
  /** Optional override for the close button's accessible label. */
  closeLabel?: string;
  /** Optional footer node, rendered at the bottom separated by a surface-aware divider. */
  footer?: React.ReactNode;
  /** Optional description, wired via `aria-describedby` for AT users. */
  description?: React.ReactNode;
  /**
   * When provided, the close button awaits this promise (and shows a loading
   * state) before the consumer-controlled `onClose` is invoked. Lets callers
   * persist or animate-out before unmounting.
   */
  asyncClose?: () => Promise<void>;
  /** Optional portal container override. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

export const PixelModal = forwardRef<HTMLDivElement, PixelModalProps>(function PixelModal({
  open, title, children, onClose,
  size = 'md',
  surface: surfaceProp,
  closeLabel = 'Close',
  footer,
  description,
  asyncClose,
  container,
}, forwardedRef) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const reducedMotion = useReducedMotion();
  const pulseClass = reducedMotion ? '' : 'animate-pulse';

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    (dialogRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef && typeof forwardedRef === 'object') {
      (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [forwardedRef]);

  useFocusTrap(open, dialogRef);
  useScrollLock(open);
  useEscape(() => { if (!closing) void handleClose(); }, open);

  async function handleClose() {
    if (asyncClose) {
      try {
        setClosing(true);
        await asyncClose();
      } finally {
        setClosing(false);
        onClose();
      }
      return;
    }
    onClose();
  }

  if (!open) return null;

  const maxW =
    size === 'sm' ? 'max-w-sm' :
    size === 'lg' ? 'max-w-2xl' :
    size === 'xl' ? 'max-w-4xl' :
    size === 'full' ? 'max-w-[95vw] max-h-[95vh] overflow-y-auto' :
    'max-w-md';

  const dividerClass = surface === 'pixel'
    ? 'border-t-2 border-retro-border'
    : 'border-t border-retro-border';

  return (
    <PixelPortal container={container}>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <OverlayBackdrop
          position="fixed"
          onClick={() => { if (!closing) void handleClose(); }}
        />
        <div
          ref={setRefs}
          className={cn(
            'relative w-full bg-retro-bg shadow-2xl',
            s.border, s.radiusLg, 'border-retro-border',
            surface === 'pixel' ? 'p-0' : 'p-5',
            maxW,
          )}
        >
          {surface === 'pixel' ? (
            <>
              <div className={cn('flex items-center justify-between border-b-2 border-retro-border bg-retro-surface/60 px-3 py-2')}>
                <h4 id={titleId} className="font-pixel text-[11px] text-retro-green">{upper(title)}</h4>
                <button
                  type="button"
                  onClick={() => { void handleClose(); }}
                  aria-label={closeLabel}
                  aria-busy={closing || undefined}
                  disabled={closing}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center border-2 border-retro-border text-retro-muted transition-colors hover:bg-retro-red/10 hover:border-retro-red/40 hover:text-retro-red focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-red/40',
                    closing && 'opacity-60 cursor-wait',
                  )}
                >
                  {closing ? <span aria-hidden className={cn('block h-2 w-2 bg-retro-muted', pulseClass)} /> : <CloseIcon />}
                </button>
              </div>
              <div className="p-5 text-sm text-retro-muted">
                {description && <p id={descId} className="mb-3 text-xs text-retro-muted/80">{description}</p>}
                {children}
              </div>
              {footer && (
                <div className={cn(dividerClass, 'flex items-center justify-end gap-2 bg-retro-surface/40 px-5 py-3')}>
                  {footer}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h4 id={titleId} className={cn('text-base font-semibold text-retro-text', s.fontDisplay)}>{upper(title)}</h4>
                <button
                  type="button"
                  onClick={() => { void handleClose(); }}
                  aria-label={closeLabel}
                  aria-busy={closing || undefined}
                  disabled={closing}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border border-retro-border text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40',
                    closing && 'opacity-60 cursor-wait',
                  )}
                >
                  {closing ? <span aria-hidden className={cn('block h-2 w-2 rounded-full bg-retro-muted', pulseClass)} /> : <CloseIcon />}
                </button>
              </div>
              {description && <p id={descId} className="mb-3 text-xs text-retro-muted/80">{description}</p>}
              <div className="text-sm text-retro-muted">{children}</div>
              {footer && (
                <div className={cn(dividerClass, 'mt-5 flex items-center justify-end gap-2 pt-4')}>
                  {footer}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PixelPortal>
  );
});
PixelModal.displayName = 'PixelModal';
