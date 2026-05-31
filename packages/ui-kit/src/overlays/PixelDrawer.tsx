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
import { useScrollLock } from '../hooks/useScrollLock';
import { useEscape } from '../hooks/useEscape';

type DrawerSide = 'right' | 'left' | 'top' | 'bottom';
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface PixelDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: DrawerSide;
  size?: DrawerSize;
  overlay?: boolean;
  dismissOnOverlay?: boolean;
  trapFocus?: boolean;
  title?: string;
  description?: string;
  /**
   * Accessible name fallback when `title` is omitted. WCAG 4.1.2 requires
   * every `role="dialog"` to expose a name; supply `title` OR `aria-label`.
   */
  'aria-label'?: string;
  surface?: Surface;
  container?: HTMLElement | null;
  children: React.ReactNode;
}

const sideWidth: Record<DrawerSize, string> = {
  sm: 'w-[280px]',
  md: 'w-[360px]',
  lg: 'w-[480px]',
  xl: 'w-[640px]',
  full: 'w-screen',
};

const sideHeight: Record<DrawerSize, string> = {
  sm: 'h-[200px]',
  md: 'h-[320px]',
  lg: 'h-[440px]',
  xl: 'h-[560px]',
  full: 'h-screen',
};

function sidePositionClasses(side: DrawerSide, size: DrawerSize): string {
  switch (side) {
    case 'right':
      return cn(
        'right-0 top-0 h-full max-w-full',
        sideWidth[size],
        'translate-x-0 motion-safe:animate-[pxl-drawer-in-right_180ms_ease-out]',
      );
    case 'left':
      return cn(
        'left-0 top-0 h-full max-w-full',
        sideWidth[size],
        'translate-x-0 motion-safe:animate-[pxl-drawer-in-left_180ms_ease-out]',
      );
    case 'top':
      return cn(
        'top-0 left-0 w-full max-h-full',
        sideHeight[size],
        'translate-y-0 motion-safe:animate-[pxl-drawer-in-top_180ms_ease-out]',
      );
    case 'bottom':
      return cn(
        'bottom-0 left-0 w-full max-h-full',
        sideHeight[size],
        'translate-y-0 motion-safe:animate-[pxl-drawer-in-bottom_180ms_ease-out]',
      );
  }
}

type DrawerComponent = React.ForwardRefExoticComponent<
  PixelDrawerProps & React.RefAttributes<HTMLDivElement>
> & {
  Header: typeof PixelDrawerHeader;
  Body: typeof PixelDrawerBody;
  Footer: typeof PixelDrawerFooter;
};

const PixelDrawerRoot = forwardRef<HTMLDivElement, PixelDrawerProps>(
  function PixelDrawer(
    {
      open,
      onOpenChange,
      side = 'right',
      size = 'md',
      overlay = true,
      dismissOnOverlay = true,
      trapFocus = true,
      title,
      description,
      'aria-label': ariaLabel,
      surface: surfaceProp,
      container,
      children,
    },
    forwardedRef,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const titleId = useId();
    const descId = useId();
    const panelRef = useRef<HTMLDivElement | null>(null);

    useFocusTrap(open && trapFocus, panelRef);
    useScrollLock(open);
    useEscape(() => {
      if (open) onOpenChange(false);
    }, open);

    // Dev-only WCAG 4.1.2 guard: every role=dialog needs an accessible name.
    if (
      process.env.NODE_ENV !== 'production' &&
      open &&
      !title &&
      !ariaLabel &&
      typeof console !== 'undefined'
    ) {
      console.warn(
        '[PixelDrawer] role="dialog" has no accessible name. Pass either `title` or `aria-label`.',
      );
    }

    if (!open) return null;

    const setRefs = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef && typeof forwardedRef === 'object') {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    return (
      <PixelPortal container={container}>
        <div className="fixed inset-0 z-[80]">
          {overlay && (
            <div
              data-pxl-drawer-overlay
              aria-hidden="true"
              className="absolute inset-0 bg-retro-text/60 backdrop-blur-sm"
              onClick={() => {
                if (dismissOnOverlay) onOpenChange(false);
              }}
            />
          )}
          <div
            ref={setRefs}
            data-pxl-drawer-panel
            role="dialog"
            aria-modal="true"
            aria-label={!title ? ariaLabel : undefined}
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            className={cn(
              'fixed bg-retro-bg shadow-2xl flex flex-col outline-none',
              s.border,
              'border-retro-border',
              sidePositionClasses(side, size),
            )}
          >
            {(title || description) && (
              <div className="sr-only">
                {title && <span id={titleId}>{title}</span>}
                {description && <span id={descId}>{description}</span>}
              </div>
            )}
            {children}
          </div>
        </div>
      </PixelPortal>
    );
  },
);
PixelDrawerRoot.displayName = 'PixelDrawer';

/* ──────────────────────────────────────────────────────────────────────────
   PixelDrawer.Header
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelDrawerHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  surface?: Surface;
}

const PixelDrawerHeader = forwardRef<HTMLDivElement, PixelDrawerHeaderProps>(
  function PixelDrawerHeader(
    { className, children, surface: surfaceProp, ...rest },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const dividerClass =
      surface === 'pixel'
        ? 'border-b-2 border-retro-border'
        : 'border-b border-retro-border';
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-3 bg-retro-surface/40',
          dividerClass,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
PixelDrawerHeader.displayName = 'PixelDrawer.Header';

/* ──────────────────────────────────────────────────────────────────────────
   PixelDrawer.Body
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelDrawerBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const PixelDrawerBody = forwardRef<HTMLDivElement, PixelDrawerBodyProps>(
  function PixelDrawerBody({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex-1 overflow-y-auto px-4 py-4', className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
PixelDrawerBody.displayName = 'PixelDrawer.Body';

/* ──────────────────────────────────────────────────────────────────────────
   PixelDrawer.Footer
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelDrawerFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  surface?: Surface;
}

const PixelDrawerFooter = forwardRef<HTMLDivElement, PixelDrawerFooterProps>(
  function PixelDrawerFooter(
    { className, children, surface: surfaceProp, ...rest },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const dividerClass =
      surface === 'pixel'
        ? 'border-t-2 border-retro-border'
        : 'border-t border-retro-border';
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-2 px-4 py-3 bg-retro-surface/40',
          dividerClass,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
PixelDrawerFooter.displayName = 'PixelDrawer.Footer';

export const PixelDrawer = PixelDrawerRoot as DrawerComponent;
PixelDrawer.Header = PixelDrawerHeader;
PixelDrawer.Body = PixelDrawerBody;
PixelDrawer.Footer = PixelDrawerFooter;
