import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { alertDialogClasses, alertDialogLayerClasses } from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { OverlayBackdrop } from './_internal/OverlayBackdrop';
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
  const titleId = useId();
  const descId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const reducedMotion = useReducedMotion();

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

  const c = alertDialogClasses(surface, { destructive, reducedMotion });
  const descriptionNode = description && <p id={descId} className={c.description}>{description}</p>;
  const actions = (
    <div className={c.actions}>
      <button
        ref={cancelBtnRef}
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className={c.cancel}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={handleAction}
        disabled={pending}
        className={c.action}
      >
        {pending && <span aria-hidden className={c.spinner} />}
        <span>{actionLabel}</span>
      </button>
    </div>
  );

  return (
    <PixelPortal>
      <div className={alertDialogLayerClasses}>
        <OverlayBackdrop
          position="fixed"
          onClick={handleCancel}
        />
        <div
          ref={setRefs}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={c.panel}
        >
          {surface === 'pixel' ? (
            <>
              <div className={c.header}>
                <span aria-hidden className={c.accent} />
                <h2 id={titleId} className={c.title}>{title}</h2>
              </div>
              <div className={c.body}>
                {descriptionNode}
                {actions}
              </div>
            </>
          ) : (
            <>
              <div className={c.header}>
                <span aria-hidden className={c.accent} />
                <div className={c.texts}>
                  <h2 id={titleId} className={c.title}>{title}</h2>
                  {descriptionNode}
                </div>
              </div>
              {actions}
            </>
          )}
        </div>
      </div>
    </PixelPortal>
  );
});
PixelAlertDialog.displayName = 'PixelAlertDialog';
