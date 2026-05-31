import React, { forwardRef } from 'react';
import { cn } from '../common';
import { useTabsContext } from './_internal/tabsContext';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTabsList — tablist container with optional horizontal scroll fade-mask.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelTabsList}. */
export interface PixelTabsListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Accessible label announced for the tablist. */
  ariaLabel?: string;
  /** When true, the tablist scrolls horizontally with a fade-mask. Ignored for vertical orientation. */
  scrollable?: boolean;
}

export const PixelTabsList = forwardRef<HTMLDivElement, PixelTabsListProps>(
  function PixelTabsList({ ariaLabel = 'Tabs', scrollable = false, className, children, ...rest }, ref) {
    const ctx = useTabsContext('PixelTabs.List');
    const isVertical = ctx.orientation === 'vertical';
    const effectiveScrollable = scrollable && !isVertical;

    return (
      <div
        className={cn(
          // Vertical: column container with border on the right.
          isVertical
            ? 'flex flex-col gap-1 self-start border-r-2 border-retro-border/40 pr-px'
            : 'border-b-2 border-retro-border/40 pb-px',
          effectiveScrollable && 'relative',
          className,
        )}
      >
        <div
          ref={ref}
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation={ctx.orientation}
          className={cn(
            'flex gap-1',
            isVertical ? 'flex-col' : 'flex-wrap',
            effectiveScrollable && 'flex-nowrap overflow-x-auto scrollbar-hidden',
            effectiveScrollable && 'overflow-y-hidden',
          )}
          data-scrollable={effectiveScrollable ? 'true' : undefined}
          style={
            effectiveScrollable
              ? ({
                  // Fade-mask on left/right edges for horizontal overflow indicator.
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)',
                  maskImage:
                    'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)',
                  scrollbarWidth: 'none',
                } as React.CSSProperties)
              : undefined
          }
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);

PixelTabsList.displayName = 'PixelTabs.List';
