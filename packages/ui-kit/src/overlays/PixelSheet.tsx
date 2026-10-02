'use client';

import React, { forwardRef, useId, useRef } from 'react';
import { sheetClasses, sheetLayerClasses, type SheetSide, type SheetSize } from '@pxlkit/ui-kit-core';
import {
  Surface,
  useEffectiveSurface,
} from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { OverlayBackdrop } from './_internal/OverlayBackdrop';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useEscape } from '../hooks/useEscape';
import { useScrollLock } from '../hooks/useScrollLock';

/** Public prop bag for {@link PixelSheet}. */
export interface PixelSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: SheetSide;
  size?: SheetSize;
  dragHandle?: boolean;
  surface?: Surface;
  title?: string;
  description?: string;
  /**
   * Accessible name fallback when `title` is omitted. WCAG 4.1.2 requires
   * every `role="dialog"` to expose a name; supply `title` OR `aria-label`.
   */
  'aria-label'?: string;
  children: React.ReactNode;
}

export const PixelSheet = forwardRef<HTMLDivElement, PixelSheetProps>(function PixelSheet(
  {
    open,
    onOpenChange,
    side = 'bottom',
    size = 'md',
    dragHandle = false,
    surface: surfaceProp,
    title,
    description,
    'aria-label': ariaLabel,
    children,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useFocusTrap(open, panelRef);
  useScrollLock(open);
  useEscape(() => onOpenChange(false), open);

  // Dev-only WCAG 4.1.2 guard: every role=dialog needs an accessible name.
  if (
    process.env.NODE_ENV !== 'production' &&
    open &&
    !title &&
    !ariaLabel &&
    typeof console !== 'undefined'
  ) {
    console.warn(
      '[PixelSheet] role="dialog" has no accessible name. Pass either `title` or `aria-label`.',
    );
  }

  if (!open) return null;

  const isBottom = side === 'bottom';
  const c = sheetClasses(surface, side, size);
  const enterFrom = isBottom ? 'translate-y-full' : '-translate-y-full';
  void enterFrom; // kept for parity with future motion phase

  const setPanelRef = (node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <PixelPortal>
      <div className={sheetLayerClasses} data-pixel-sheet="">
        {/* scrim */}
        <OverlayBackdrop
          position="absolute"
          onClick={() => onOpenChange(false)}
        />
        {/* panel */}
        <div
          ref={setPanelRef}
          role="dialog"
          aria-modal="true"
          aria-label={!title ? ariaLabel : undefined}
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          data-side={side}
          data-size={size}
          className={c.panel}
        >
          {/* On a top sheet the handle is drawn last, next to its free edge. */}
          {dragHandle && (
            <div
              data-testid="pixel-sheet-drag-handle"
              aria-hidden="true"
              className={c.handle}
            >
              <span className={c.handleBar} />
            </div>
          )}
          {(title || description) && (
            <div className={c.header}>
              {title && (
                <h4 id={titleId} className={c.title}>
                  {title}
                </h4>
              )}
              {description && (
                <p id={descId} className={c.description}>
                  {description}
                </p>
              )}
            </div>
          )}
          <div className={c.body}>{children}</div>
        </div>
      </div>
    </PixelPortal>
  );
});

PixelSheet.displayName = 'PixelSheet';
