'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';

export interface PixelNavigationMenuItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  content?: ReactNode;
  icon?: ReactNode;
  description?: string;
}

export interface PixelNavigationMenuProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  items: PixelNavigationMenuItem[];
  orientation?: 'horizontal' | 'vertical';
  viewport?: boolean;
  surface?: Surface;
  /**
   * Accessible name for the nav landmark. Required when more than one nav
   * lands on the same page (WCAG 2.4.6). Defaults to "Main navigation".
   */
  ariaLabel?: string;
}

export const PixelNavigationMenu = forwardRef<
  HTMLElement,
  PixelNavigationMenuProps
>(function PixelNavigationMenu(
  {
    items,
    orientation = 'horizontal',
    viewport = true,
    surface: surfaceProp,
    ariaLabel = 'Main navigation',
    className,
    onMouseLeave,
    ...rest
  },
  forwardedRef,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const baseId = useId();

  // Reset refs length to match items.
  itemRefs.current.length = items.length;

  const closeAll = useCallback(() => setActiveIndex(null), []);

  const openIndex = useCallback(
    (idx: number) => {
      const item = items[idx];
      if (!item) return;
      if (item.content) setActiveIndex(idx);
      else setActiveIndex(null);
    },
    [items],
  );

  const focusItem = useCallback((idx: number) => {
    const el = itemRefs.current[idx];
    if (el) el.focus();
  }, []);

  const handleItemKeyDown = (
    e: ReactKeyboardEvent<HTMLElement>,
    idx: number,
  ) => {
    const item = items[idx];
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    if (e.key === nextKey) {
      e.preventDefault();
      const next = (idx + 1) % items.length;
      focusItem(next);
    } else if (e.key === prevKey) {
      e.preventDefault();
      const prev = (idx - 1 + items.length) % items.length;
      focusItem(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(items.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAll();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!item) return;
      // Anchors handle Enter natively — let the browser navigate.
      if (item.href) return;
      e.preventDefault();
      if (item.content) {
        setActiveIndex((cur) => (cur === idx ? null : idx));
      }
      item.onSelect?.();
    }
  };

  const handleRootMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    onMouseLeave?.(e);
    if (!e.defaultPrevented) closeAll();
  };

  const listOrientationClass =
    orientation === 'horizontal'
      ? 'flex flex-row items-stretch gap-1'
      : 'flex flex-col items-stretch gap-1';

  const setItemRef = (idx: number) => (node: HTMLElement | null) => {
    itemRefs.current[idx] = node;
  };

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const activeContent = activeItem?.content;

  return (
    <nav
      ref={forwardedRef}
      // <nav> already implies role=navigation; the previously-redundant
      // role attr was removed. aria-orientation is NOT allowed on a nav
      // landmark (axe: aria-allowed-attr) — it lives on the menubar below.
      aria-label={ariaLabel}
      className={cn('relative inline-block', s.font, className)}
      onMouseLeave={handleRootMouseLeave}
      {...rest}
    >
      <ul
        role="menubar"
        aria-orientation={orientation}
        className={cn(listOrientationClass, 'list-none p-0 m-0')}
      >
        {items.map((item, idx) => {
          const hasContent = Boolean(item.content);
          const expanded = activeIndex === idx && hasContent;
          const triggerId = `${baseId}-trigger-${idx}`;
          const panelId = `${baseId}-panel-${idx}`;
          const sharedClass = cn(
            'inline-flex items-center gap-2 px-3 py-2 text-sm text-retro-text outline-none',
            'cursor-pointer select-none',
            s.font,
            s.radius,
            'hover:bg-retro-surface/40',
            'focus-visible:ring-2 focus-visible:ring-retro-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
            expanded && 'bg-retro-surface/60',
          );

          const commonProps = {
            id: triggerId,
            role: 'menuitem' as const,
            tabIndex: 0,
            ref: setItemRef(idx) as React.Ref<HTMLElement>,
            'aria-haspopup': hasContent ? ('menu' as const) : undefined,
            'aria-expanded': hasContent ? expanded : undefined,
            'aria-controls': hasContent && expanded ? panelId : undefined,
            onMouseEnter: () => {
              if (hasContent) openIndex(idx);
              else setActiveIndex(null);
            },
            onFocus: () => {
              if (hasContent) openIndex(idx);
            },
            onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) =>
              handleItemKeyDown(e, idx),
            className: sharedClass,
          };

          const inner = (
            <>
              {item.icon && (
                <span
                  aria-hidden
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-retro-muted"
                >
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </>
          );

          return (
            <li
              key={`${item.label}-${idx}`}
              role="none"
              className="relative list-none"
            >
              {item.href ? (
                <a
                  {...(commonProps as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
                    ref: React.Ref<HTMLAnchorElement>;
                  })}
                  href={item.href}
                  onClick={(e) => {
                    if (item.onSelect) {
                      item.onSelect();
                    }
                    if (hasContent) {
                      // For href + content, prevent navigation when toggling.
                      e.preventDefault();
                      setActiveIndex((cur) => (cur === idx ? null : idx));
                    }
                  }}
                >
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  {...(commonProps as React.ButtonHTMLAttributes<HTMLButtonElement> & {
                    ref: React.Ref<HTMLButtonElement>;
                  })}
                  onClick={() => {
                    if (hasContent) {
                      setActiveIndex((cur) => (cur === idx ? null : idx));
                    }
                    item.onSelect?.();
                  }}
                >
                  {inner}
                </button>
              )}

              {/* Inline panel (used when viewport=false). */}
              {!viewport && expanded && item.content && (
                <div
                  id={panelId}
                  role="menu"
                  aria-labelledby={triggerId}
                  className={cn(
                    'absolute left-0 top-full z-50 mt-2 min-w-[16rem] bg-retro-bg p-3 shadow-xl',
                    s.border,
                    s.radiusLg,
                    'border-retro-border',
                  )}
                >
                  {item.content}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Shared viewport — one panel below the menubar. */}
      {viewport && activeContent && activeIndex !== null && (
        <div
          id={`${baseId}-panel-${activeIndex}`}
          role="menu"
          aria-labelledby={`${baseId}-trigger-${activeIndex}`}
          className={cn(
            orientation === 'horizontal'
              ? 'absolute left-0 top-full mt-2'
              : 'absolute left-full top-0 ml-2',
            'z-50 min-w-[20rem] bg-retro-bg p-4 shadow-xl',
            s.border,
            s.radiusLg,
            'border-retro-border',
          )}
        >
          {activeContent}
        </div>
      )}
    </nav>
  );
});

PixelNavigationMenu.displayName = 'PixelNavigationMenu';
