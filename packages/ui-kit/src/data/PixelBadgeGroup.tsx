'use client';

import React, {
  Children,
  forwardRef,
  isValidElement,
  useId,
  useState,
} from 'react';
import {
  badgeGroupClasses,
  badgeGroupOverflowClasses,
  badgeGroupTriggerClasses,
  badgeGroupTriggerLabel,
  groupOverflow,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
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
  /**
   * Most places the row shows; beyond it, the last place becomes a "+N" button that opens a popover
   * with the rest.
   */
  max?: number;
  /** Surface override, for the row and its popover; defaults to the nearest provider. */
  surface?: Surface;
  /**
   * Optional accessible name for the group. When provided, the wrapper renders
   * `role="group"` so SR users can navigate the landmark; otherwise it stays a
   * plain div to avoid an unlabeled group announcement.
   */
  'aria-label'?: string;
  /** Id of the element that names the group, in place of `aria-label`. */
  'aria-labelledby'?: string;
  /** The badges. */
  children: React.ReactNode;
}

export const PixelBadgeGroup = forwardRef<HTMLDivElement, PixelBadgeGroupProps>(
  function PixelBadgeGroup(
    { max = 5, surface: surfaceProp, className, children, ...rest },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const [open, setOpen] = useState(false);
    // The "+N" button names the popover it opens.
    const triggerId = useId();

    const items = Children.toArray(children).filter(isValidElement);
    const { visible: visibleCount, hidden: remainder } = groupOverflow(items.length, max);
    const visible = items.slice(0, visibleCount);
    const hidden = items.slice(visibleCount);

    const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
    const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
    const hasName = !!(ariaLabel || ariaLabelledBy);

    return (
      <div
        ref={ref}
        role={hasName ? 'group' : undefined}
        className={cn(badgeGroupClasses, className)}
        {...rest}
      >
        {visible.map((child, idx) => (
          <React.Fragment key={(child as React.ReactElement).key ?? idx}>
            {child}
          </React.Fragment>
        ))}
        {remainder > 0 && (
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
                id={triggerId}
                aria-label={badgeGroupTriggerLabel(remainder)}
                className={badgeGroupTriggerClasses(surface)}
              >
                {`+${remainder}`}
              </button>
            </PixelPopover.Trigger>
            <PixelPopover.Content surface={surface} aria-labelledby={triggerId}>
              <div className={badgeGroupOverflowClasses}>
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
