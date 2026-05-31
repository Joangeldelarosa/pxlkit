import React, { forwardRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PixelPortalProps {
  children: React.ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
}

/**
 * Portals children to `container` (default: `document.body`). On the server
 * AND on the first client render, renders children inline so SSR + first-paint
 * hydration are non-empty; switches to a real `createPortal` after mount.
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

function PixelPortalClient({
  children,
  container,
  disabled,
}: PixelPortalProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) return <>{children}</>;
  // Pre-mount on the client: render children inline (matches SSR output so
  // hydration doesn't tear). After mount we swap to a real portal.
  if (!mounted) return <>{children}</>;

  const target = container ?? document.body;
  return createPortal(children, target);
}
