import React, { forwardRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

export interface PixelPortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
}

/**
 * Portals children to `container` (default: `document.body`). On the server
 * and while hydrating, renders children inline so the server HTML is
 * non-empty and hydration matches it; switches to a real `createPortal` right
 * after. Content mounted later on the client is portaled from its first
 * render, so it is created once, in place — focus set by a modal's focus trap
 * stays where it was put.
 */
export const PixelPortal = forwardRef<HTMLDivElement, PixelPortalProps>(
  function PixelPortal({ children, container, disabled }, _ref) {
    // SSR / pre-mount: render inline so the DOM has SOMETHING to hydrate.
    // The wrapper component owns the post-mount portal swap.
    if (typeof window === 'undefined') return <>{children}</>;
    return (
      <PixelPortalClient container={container} disabled={disabled}>
        {children}
      </PixelPortalClient>
    );
  },
);
PixelPortal.displayName = 'PixelPortal';

// Hydration reads the server snapshot (inline, as on the server); any other
// client render reads the client one (portal). Neither ever changes.
const subscribeNever = () => () => {};
const portalOnClient = () => true;
const inlineOnServer = () => false;

function PixelPortalClient({
  children,
  container,
  disabled,
}: PixelPortalProps): React.ReactElement | null {
  const portal = useSyncExternalStore(subscribeNever, portalOnClient, inlineOnServer);

  if (disabled || !portal) return <>{children}</>;

  const target = container ?? document.body;
  return createPortal(children, target);
}
