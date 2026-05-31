import React, { forwardRef } from 'react';
import { cn, focusRing, surfaceClasses } from '../common';
import { useTabsContext } from './_internal/tabsContext';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTabsPanel — tabpanel content region for a single tab value.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelTabsPanel}. */
export interface PixelTabsPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Tab id this panel belongs to — must match a {@link PixelTabsTrigger} value. */
  value: string;
  /** Override the root's keepMounted setting for this panel. */
  keepMounted?: boolean;
}

export const PixelTabsPanel = forwardRef<HTMLDivElement, PixelTabsPanelProps>(
  function PixelTabsPanel({ value, keepMounted, className, children, ...rest }, ref) {
    const ctx = useTabsContext('PixelTabs.Panel');
    const s = surfaceClasses(ctx.surface);
    const selected = ctx.active === value;
    const shouldMount = (keepMounted ?? ctx.keepMounted) || selected;

    if (!shouldMount) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${ctx.baseId}-panel-${value}`}
        aria-labelledby={`${ctx.baseId}-tab-${value}`}
        hidden={!selected}
        data-state={selected ? 'active' : 'inactive'}
        tabIndex={0}
        className={cn(
          'bg-retro-bg/50 p-3 text-sm text-retro-muted outline-none',
          s.border, s.radius, 'border-retro-border/40',
          focusRing, 'focus-visible:ring-retro-cyan/30',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

PixelTabsPanel.displayName = 'PixelTabs.Panel';
