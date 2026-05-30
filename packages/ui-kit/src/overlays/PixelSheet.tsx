'use client';

import React, { forwardRef, useId, useRef } from 'react';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useEscape } from '../hooks/useEscape';
import { useScrollLock } from '../hooks/useScrollLock';

/** Public prop bag for {@link PixelSheet}. */
export interface PixelSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'bottom' | 'top';
  size?: 'sm' | 'md' | 'lg' | 'full';
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

// Mobile bottom-sheet preset. Shares the bottom-sheet pattern slated for
// PixelDrawer (Ola 4 will fold them together with snap points); for Ola 3 we
// stand on PixelPortal + Ola 1 hooks directly and keep the API stable.
const sizeMap = {
  bottom: {
    sm: 'h-1/4',
    md: 'h-1/2',
    lg: 'h-3/4',
    full: 'h-[100dvh]',
  },
  top: {
    sm: 'h-1/4',
    md: 'h-1/2',
    lg: 'h-3/4',
    full: 'h-[100dvh]',
  },
} as const;

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
  const s = surfaceClasses(surface);
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
  const sideAnchor = isBottom
    ? 'bottom-0 left-0 right-0'
    : 'top-0 left-0 right-0';
  const enterFrom = isBottom ? 'translate-y-full' : '-translate-y-full';
  void enterFrom; // kept for parity with future motion phase

  const setPanelRef = (node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <PixelPortal>
      <div className="fixed inset-0 z-[90]" data-pixel-sheet="">
        {/* scrim */}
        <div
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
          className={cn(
            'absolute flex flex-col bg-retro-bg shadow-2xl',
            sideAnchor,
            sizeMap[side][size],
            s.border,
            'border-retro-border',
            isBottom
              ? surface === 'pixel'
                ? 'border-t-2'
                : 'rounded-t-2xl border-t'
              : surface === 'pixel'
                ? 'border-b-2'
                : 'rounded-b-2xl border-b',
          )}
        >
          {dragHandle && isBottom && (
            <div
              data-testid="pixel-sheet-drag-handle"
              aria-hidden="true"
              className="flex h-5 shrink-0 items-center justify-center"
            >
              <span
                className={cn(
                  'h-1 w-10 bg-retro-border',
                  surface === 'pixel' ? 'rounded-none' : 'rounded-full',
                )}
              />
            </div>
          )}
          {dragHandle && !isBottom && (
            <div
              data-testid="pixel-sheet-drag-handle"
              aria-hidden="true"
              className="order-last flex h-5 shrink-0 items-center justify-center"
            >
              <span
                className={cn(
                  'h-1 w-10 bg-retro-border',
                  surface === 'pixel' ? 'rounded-none' : 'rounded-full',
                )}
              />
            </div>
          )}
          {(title || description) && (
            <div className="border-b border-retro-border/60 px-5 py-3">
              {title && (
                <h4 id={titleId} className={cn('text-sm font-semibold text-retro-text', s.fontDisplay)}>
                  {title}
                </h4>
              )}
              {description && (
                <p id={descId} className="mt-1 text-xs text-retro-muted">
                  {description}
                </p>
              )}
            </div>
          )}
          <div className="flex-1 overflow-auto p-5 text-sm text-retro-muted">{children}</div>
        </div>
      </div>
    </PixelPortal>
  );
});

PixelSheet.displayName = 'PixelSheet';
