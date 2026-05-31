import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useEscape } from '../hooks/useEscape';
import { useScrollLock } from '../hooks/useScrollLock';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface PixelAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  actionLabel?: string;
  onAction: () => void | Promise<void>;
  /**
   * Called when `onAction` throws / rejects. Receives the thrown value.
   * When set, the dialog stays OPEN on failure so the consumer can show
   * an inline error. When unset, errors are silently swallowed (back-compat).
   */
  onError?: (error: unknown) => void;
  destructive?: boolean;
  surface?: Surface;
}

export const PixelAlertDialog = forwardRef<HTMLDivElement, PixelAlertDialogProps>(function PixelAlertDialog(
  {
    open,
    onOpenChange,
    title,
    description,
    cancelLabel = 'Cancel',
    actionLabel = 'Confirm',
    onAction,
    onError,
    destructive = false,
    surface: surfaceProp,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const titleId = useId();
  const descId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const reducedMotion = useReducedMotion();
  const spinClass = reducedMotion ? '' : 'animate-spin';

  const setRefs = (node: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  useScrollLock(open);
  useFocusTrap(open, containerRef);
  useEscape(() => {
    if (pending) return;
    onOpenChange(false);
  }, open);

  // Pin focus to the Cancel button on open (safer default for destructive flows).
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => cancelBtnRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [open]);

  // Reset pending when the dialog is closed externally.
  useEffect(() => {
    if (!open) setPending(false);
  }, [open]);

  const handleCancel = useCallback(() => {
    if (pending) return;
    onOpenChange(false);
  }, [pending, onOpenChange]);

  const handleAction = useCallback(async () => {
    if (pending) return;
    let result: void | Promise<void>;
    try {
      result = onAction();
    } catch (err) {
      // Sync throw: do not auto-close so the consumer can show the error.
      if (onError) onError(err);
      else throw err;
      return;
    }
    const isPromise =
      result && typeof (result as Promise<void>).then === 'function';
    if (!isPromise) {
      onOpenChange(false);
      return;
    }
    setPending(true);
    try {
      await result;
      onOpenChange(false);
    } catch (err) {
      // Async reject: keep open + surface error.
      if (onError) onError(err);
      else if (typeof console !== 'undefined') {
        console.error('[PixelAlertDialog] onAction rejected:', err);
      }
    } finally {
      setPending(false);
    }
  }, [pending, onAction, onOpenChange, onError]);

  if (!open) return null;

  const accentTone = destructive ? 'red' : 'cyan';
  const t = toneMap[accentTone];

  return (
    <PixelPortal>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      >
        <div
          className="fixed inset-0 bg-retro-text/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={handleCancel}
        />
        <div
          ref={setRefs}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={cn(
            'relative w-full max-w-sm bg-retro-bg shadow-2xl',
            s.border, s.radiusLg, 'border-retro-border',
            surface === 'pixel' ? 'p-0' : 'p-5',
          )}
        >
          {surface === 'pixel' ? (
            <>
              <div className={cn('flex items-center gap-2 border-b-2 border-retro-border bg-retro-surface/60 px-3 py-2')}>
                <span aria-hidden className={cn('inline-block h-2 w-2', t.fill)} />
                <h2 id={titleId} className="font-pixel text-[11px] text-retro-green">{title}</h2>
              </div>
              <div className="p-5">
                {description && (
                  <p id={descId} className={cn('text-sm text-retro-muted', s.font)}>{description}</p>
                )}
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    ref={cancelBtnRef}
                    type="button"
                    onClick={handleCancel}
                    disabled={pending}
                    className={cn(
                      'inline-flex items-center justify-center px-4 h-9 text-xs font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                      s.border, s.radius, s.font, s.transition,
                      'border-retro-border text-retro-muted hover:bg-retro-surface/70 hover:text-retro-text',
                      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-border',
                    )}
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleAction}
                    disabled={pending}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 px-4 h-9 text-xs font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                      s.border, s.radius, s.font, s.transition,
                      t.border, t.bg, t.text, t.hover,
                      'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg', t.ring,
                    )}
                  >
                    {pending && (
                      <span
                        aria-hidden
                        className={cn(
                          'inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent',
                          spinClass,
                        )}
                      />
                    )}
                    <span>{actionLabel}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span aria-hidden className={cn('mt-1 inline-block h-2 w-2 rounded-full', t.fill)} />
                <div className="flex-1">
                  <h2 id={titleId} className={cn('text-base font-semibold text-retro-text', s.fontDisplay)}>{title}</h2>
                  {description && (
                    <p id={descId} className={cn('mt-2 text-sm text-retro-muted', s.font)}>{description}</p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  ref={cancelBtnRef}
                  type="button"
                  onClick={handleCancel}
                  disabled={pending}
                  className={cn(
                    'inline-flex items-center justify-center px-4 h-9 text-sm font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                    s.border, s.radius, s.font, s.transition,
                    'border-retro-border text-retro-muted hover:bg-retro-surface/70 hover:text-retro-text',
                    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-border',
                  )}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={pending}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-4 h-9 text-sm font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
                    s.border, s.radius, s.font, s.transition,
                    t.border, t.bg, t.text, t.hover,
                    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg', t.ring,
                  )}
                >
                  {pending && (
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
                    />
                  )}
                  <span>{actionLabel}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </PixelPortal>
  );
});
PixelAlertDialog.displayName = 'PixelAlertDialog';
