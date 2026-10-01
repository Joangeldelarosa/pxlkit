/* ─────────────────────────────────────────────────────────────────────────
   PixelModal — dialog with title bar (pixel surface = old-school window).
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import { modalClasses, modalLayerClasses, type ModalSize } from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface, CloseIcon } from '../common';
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
  size?: ModalSize;
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
  const { upper } = usePxlKitLocale();
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const reducedMotion = useReducedMotion();

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

  const c = modalClasses(surface, size, { closing, reducedMotion });

  const closeButton = (
    <button
      type="button"
      onClick={() => { void handleClose(); }}
      aria-label={closeLabel}
      aria-busy={closing || undefined}
      disabled={closing}
      className={c.closeButton}
    >
      {closing ? <span aria-hidden className={c.busy} /> : <CloseIcon />}
    </button>
  );
  const descriptionNode = description && <p id={descId} className={c.description}>{description}</p>;

  return (
    <PixelPortal container={container}>
      <div
        className={modalLayerClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <OverlayBackdrop
          position="fixed"
          onClick={() => { if (!closing) void handleClose(); }}
        />
        <div ref={setRefs} className={c.panel}>
          <div className={c.header}>
            <h4 id={titleId} className={c.title}>{upper(title)}</h4>
            {closeButton}
          </div>
          {surface === 'pixel' ? (
            // The window body holds the description too.
            <div className={c.body}>
              {descriptionNode}
              {children}
            </div>
          ) : (
            <>
              {descriptionNode}
              <div className={c.body}>{children}</div>
            </>
          )}
          {footer && <div className={c.footer}>{footer}</div>}
        </div>
      </div>
    </PixelPortal>
  );
});
PixelModal.displayName = 'PixelModal';
