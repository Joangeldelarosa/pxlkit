'use client';

import React, {
  forwardRef,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  navigationMenuClasses,
  navigationMenuClick,
  navigationMenuFocusIndex,
  navigationMenuIconClasses,
  navigationMenuItemClasses,
  navigationMenuKeyAction,
  navigationMenuLabelClasses,
  navigationMenuListClasses,
  navigationMenuPanelClasses,
  navigationMenuPanelEntry,
  navigationMenuPanelId,
  navigationMenuPointerEnter,
  navigationMenuPointerLeave,
  navigationMenuTriggerClasses,
  navigationMenuViewportClasses,
  returnNavigationMenuFocus,
  type NavigationMenuOpen,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
  useEffectiveSurface,
} from '../common';

export interface PixelNavigationMenuItem {
  label: string;
  /** Link target of an item without `content`, which is then an `<a>`. */
  href?: string;
  /** Called when the item is clicked, or activated with Enter or Space. */
  onSelect?: () => void;
  /**
   * Panel content: the item is a button that shows and hides it, and never
   * follows an `href`.
   */
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
  const [open, setOpenState] = useState<NavigationMenuOpen | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const baseId = useId();

  // Reset refs length to match items.
  itemRefs.current.length = items.length;

  // A panel closing while focus is inside it hands focus to its button.
  const setOpen = (next: NavigationMenuOpen | null) => {
    if (open && open.index !== next?.index) returnNavigationMenuFocus(itemRefs.current[open.index]);
    setOpenState(next);
  };

  const close = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (!open) return;
    e.preventDefault();
    setOpen(null);
  };

  const handleItemKeyDown = (
    e: ReactKeyboardEvent<HTMLElement>,
    idx: number,
  ) => {
    const action = navigationMenuKeyAction(e.key, orientation);
    if (action === undefined) return;
    if (action === 'close') {
      close(e);
      return;
    }
    if (action === 'panel') {
      const entry = navigationMenuPanelEntry(e.currentTarget);
      if (!entry) return;
      e.preventDefault();
      entry.focus();
      return;
    }
    e.preventDefault();
    itemRefs.current[navigationMenuFocusIndex(idx, action, items.length)]?.focus();
  };

  const handlePanelKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (navigationMenuKeyAction(e.key, orientation) === 'close') close(e);
  };

  const handleRootMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    onMouseLeave?.(e);
    if (!e.defaultPrevented) setOpen(navigationMenuPointerLeave(open));
  };

  const setItemRef = (idx: number) => (node: HTMLElement | null) => {
    itemRefs.current[idx] = node;
  };

  return (
    <nav
      ref={forwardedRef}
      // <nav> already implies role=navigation, and the WAI-ARIA disclosure
      // navigation pattern adds no roles below it: a list of links and of
      // buttons that show and hide the panel after them.
      aria-label={ariaLabel}
      className={cn(navigationMenuClasses(surface), className)}
      onMouseLeave={handleRootMouseLeave}
      {...rest}
    >
      <ul className={navigationMenuListClasses(orientation)}>
        {items.map((item, idx) => {
          const hasContent = Boolean(item.content);
          const expanded = hasContent && open?.index === idx;
          const panelId = navigationMenuPanelId(baseId, idx);

          const commonProps = {
            ref: setItemRef(idx),
            // Only a mouse opens a panel by pointing: a tap fires the
            // pointer, mouse and focus events of a hover before its click.
            onPointerEnter: (e: React.PointerEvent<HTMLElement>) =>
              setOpen(navigationMenuPointerEnter(open, idx, hasContent, e.pointerType)),
            onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) =>
              handleItemKeyDown(e, idx),
            className: navigationMenuTriggerClasses(surface, expanded),
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
              className={navigationMenuItemClasses(viewport)}
            >
              {item.href && !hasContent ? (
                <a {...commonProps} href={item.href} onClick={() => item.onSelect?.()}>
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  {...commonProps}
                  aria-expanded={hasContent ? expanded : undefined}
                  aria-controls={hasContent ? panelId : undefined}
                  onClick={() => {
                    if (hasContent) setOpen(navigationMenuClick(open, idx));
                    item.onSelect?.();
                  }}
                >
                  {inner}
                </button>
              )}

              {/* The panel follows its button, so Tab moves into it. The shared
                  viewport is drawn below the whole list all the same. */}
              {expanded && (
                <div
                  id={panelId}
                  className={
                    viewport
                      ? navigationMenuViewportClasses(surface, orientation)
                      : navigationMenuPanelClasses(surface)
                  }
                  onKeyDown={handlePanelKeyDown}
                >
                  {item.content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

PixelNavigationMenu.displayName = 'PixelNavigationMenu';
