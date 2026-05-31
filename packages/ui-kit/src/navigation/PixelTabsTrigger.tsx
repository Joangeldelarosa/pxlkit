import React, { forwardRef, useEffect, useRef } from 'react';
import { cn, focusRing, surfaceClasses } from '../common';
import { useTabsContext } from './_internal/tabsContext';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTabsTrigger — tab button with roving tabindex + keyboard nav.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelTabsTrigger}. */
export interface PixelTabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'value'> {
  /** Tab id this trigger controls — must match a {@link PixelTabsPanel} value. */
  value: string;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
}

export const PixelTabsTrigger = forwardRef<HTMLButtonElement, PixelTabsTriggerProps>(
  function PixelTabsTrigger({ value, icon, children, className, onKeyDown, onClick, onFocus, ...rest }, forwardedRef) {
    const ctx = useTabsContext('PixelTabs.Trigger');
    const s = surfaceClasses(ctx.surface);
    const isVertical = ctx.orientation === 'vertical';
    const selected = ctx.active === value;

    const innerRef = useRef<HTMLButtonElement | null>(null);
    const setRefs = (el: HTMLButtonElement | null) => {
      innerRef.current = el;
      ctx.registerTrigger(value, el);
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    useEffect(() => {
      return () => ctx.unregisterTrigger(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const tabRadius = ctx.surface === 'pixel'
      ? (isVertical ? 'rounded-l-[3px]' : 'rounded-t-[3px]')
      : (isVertical ? 'rounded-l-md' : 'rounded-t-md');

    const sideBorder = isVertical ? 'border-r-0' : 'border-b-0';
    const offset = isVertical ? '-mr-px' : '-mb-px';

    const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      switch (e.key) {
        case nextKey:
          e.preventDefault();
          ctx.focusByOffset(value, 1);
          break;
        case prevKey:
          e.preventDefault();
          ctx.focusByOffset(value, -1);
          break;
        case 'Home':
          e.preventDefault();
          ctx.focusEdge('first');
          break;
        case 'End':
          e.preventDefault();
          ctx.focusEdge('last');
          break;
        case 'Enter':
        case ' ':
          if (ctx.activationMode === 'manual') {
            e.preventDefault();
            ctx.select(value);
          }
          break;
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      onFocus?.(e);
      if (ctx.activationMode === 'automatic') {
        ctx.select(value);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      ctx.select(value);
    };

    return (
      <button
        ref={setRefs}
        type="button"
        role="tab"
        id={`${ctx.baseId}-tab-${value}`}
        aria-selected={selected}
        aria-controls={`${ctx.baseId}-panel-${value}`}
        tabIndex={selected ? 0 : -1}
        data-state={selected ? 'active' : 'inactive'}
        onKeyDown={handleKey}
        onFocus={handleFocus}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-xs outline-none transition-colors',
          offset,
          s.font, tabRadius,
          s.border, sideBorder,
          focusRing,
          selected
            ? 'border-retro-border/40 bg-retro-bg text-retro-green'
            : 'border-transparent text-retro-muted hover:text-retro-text',
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  },
);

PixelTabsTrigger.displayName = 'PixelTabs.Trigger';
