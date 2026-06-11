'use client';

import React, {
  Children,
  forwardRef,
  isValidElement,
  useState,
} from 'react';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { PixelPopover } from '../overlay-foundation/PixelPopover';

/* ──────────────────────────────────────────────────────────────────────────
   PixelBadgeGroup — inline row of badges with +N overflow popover.

   When the number of children exceeds `max`, renders the first `max - 1`
   inline and a "+N" trigger that opens a PixelPopover containing the
   remaining badges. Wraps badges in a horizontally-flowing `flex` row.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelBadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  surface?: Surface;
  /**
   * Optional accessible name for the group. When provided, the wrapper renders
   * `role="group"` so SR users can navigate the landmark; otherwise it stays a
   * plain div to avoid an unlabeled group announcement.
   */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelBadgeGroup = forwardRef<HTMLDivElement, PixelBadgeGroupProps>(
  function PixelBadgeGroup(
    { max = 5, surface: surfaceProp, className, children, ...rest },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const [open, setOpen] = useState(false);

    const items = Children.toArray(children).filter(isValidElement);
    const count = items.length;
    const overflowing = count > max;
    const visibleCount = overflowing ? Math.max(0, max - 1) : count;
    const visible = items.slice(0, visibleCount);
    const hidden = items.slice(visibleCount);
    const remainder = hidden.length;

    const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
    const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
    const hasName = !!(ariaLabel || ariaLabelledBy);

    return (
      <div
        ref={ref}
        role={hasName ? 'group' : undefined}
        className={cn('inline-flex flex-row flex-wrap items-center gap-1.5', className)}
        {...rest}
      >
        {visible.map((child, idx) => (
          <React.Fragment key={(child as React.ReactElement).key ?? idx}>
            {child}
          </React.Fragment>
        ))}
        {overflowing && (
          <PixelPopover
            open={open}
            onOpenChange={setOpen}
            surface={surface}
            haspopup="dialog"
            role="dialog"
          >
            <PixelPopover.Trigger>
              <button
                type="button"
                aria-label={`Show ${remainder} more`}
                className={cn(
                  'inline-flex items-center px-2.5 py-1 text-[11px] leading-none',
                  'bg-retro-surface/40 text-retro-text border-retro-border',
                  'transition-colors hover:bg-retro-surface/70',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60',
                  s.border,
                  s.radiusFull,
                  s.font,
                )}
              >
                {`+${remainder}`}
              </button>
            </PixelPopover.Trigger>
            <PixelPopover.Content surface={surface}>
              <div className="flex flex-row flex-wrap items-center gap-1.5 max-w-xs">
                {hidden.map((child, idx) => (
                  <React.Fragment key={(child as React.ReactElement).key ?? idx}>
                    {child}
                  </React.Fragment>
                ))}
              </div>
            </PixelPopover.Content>
          </PixelPopover>
        )}
      </div>
    );
  },
);

PixelBadgeGroup.displayName = 'PixelBadgeGroup';

// PixelChipGroup moved to its own file; re-exported so this module's API
// stays unchanged.
export { PixelChipGroup, type PixelChipGroupProps } from './PixelChipGroup';
