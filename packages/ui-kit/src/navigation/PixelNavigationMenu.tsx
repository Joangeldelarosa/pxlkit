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
  navigationMenuClasses,
  navigationMenuFocusIndex,
  navigationMenuIconClasses,
  navigationMenuIds,
  navigationMenuItemClasses,
  navigationMenuKeyAction,
  navigationMenuLabelClasses,
  navigationMenuListClasses,
  navigationMenuPanelClasses,
  navigationMenuTriggerClasses,
  navigationMenuViewportClasses,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
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
    const action = navigationMenuKeyAction(e.key, orientation);
    if (action === undefined) return;
    if (action === 'activate') {
      const item = items[idx];
      // Anchors handle Enter natively — let the browser navigate.
      if (!item || item.href) return;
      e.preventDefault();
      if (item.content) {
        setActiveIndex((cur) => (cur === idx ? null : idx));
      }
      item.onSelect?.();
      return;
    }
    e.preventDefault();
    if (action === 'close') closeAll();
    else focusItem(navigationMenuFocusIndex(idx, action, items.length));
  };

  const handleRootMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    onMouseLeave?.(e);
    if (!e.defaultPrevented) closeAll();
  };

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
      className={cn(navigationMenuClasses(surface), className)}
      onMouseLeave={handleRootMouseLeave}
      {...rest}
    >
      <ul
        role="menubar"
        aria-orientation={orientation}
        className={navigationMenuListClasses(orientation)}
      >
        {items.map((item, idx) => {
          const hasContent = Boolean(item.content);
          const expanded = activeIndex === idx && hasContent;
          const { trigger: triggerId, panel: panelId } = navigationMenuIds(baseId, idx);
          const sharedClass = navigationMenuTriggerClasses(surface, expanded);

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
                  className={navigationMenuIconClasses}
                >
                  {item.icon}
                </span>
              )}
              <span className={navigationMenuLabelClasses}>{item.label}</span>
            </>
          );

          return (
            <li
              key={`${item.label}-${idx}`}
              role="none"
              className={navigationMenuItemClasses}
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
                  className={navigationMenuPanelClasses(surface)}
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
          id={navigationMenuIds(baseId, activeIndex).panel}
          role="menu"
          aria-labelledby={navigationMenuIds(baseId, activeIndex).trigger}
          className={navigationMenuViewportClasses(surface, orientation)}
        >
          {activeContent}
        </div>
      )}
    </nav>
  );
});

PixelNavigationMenu.displayName = 'PixelNavigationMenu';
