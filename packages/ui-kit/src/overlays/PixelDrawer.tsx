'use client';

import React, { forwardRef, useId, useRef } from 'react';
import {
  drawerBodyClasses,
  drawerFooterClasses,
  drawerHeaderClasses,
  drawerLayerClasses,
  drawerPanelClasses,
  type DrawerSide,
  type DrawerSize,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
  useEffectiveSurface,
} from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { OverlayBackdrop } from './_internal/OverlayBackdrop';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { useEscape } from '../hooks/useEscape';

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
        <div className={drawerLayerClasses}>
          {overlay && (
            <OverlayBackdrop
              position="absolute"
              data-pxl-drawer-overlay=""
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
            className={drawerPanelClasses(surface, side, size)}
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
    return (
      <div
        ref={ref}
        className={cn(drawerHeaderClasses(surface), className)}
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
        className={cn(drawerBodyClasses, className)}
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
    return (
      <div
        ref={ref}
        className={cn(drawerFooterClasses(surface), className)}
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
