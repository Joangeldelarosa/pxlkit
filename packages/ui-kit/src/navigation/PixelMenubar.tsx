'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  MENUBAR_SUBMENU_ARROW,
  menubarClasses,
  menubarHasSubmenu,
  menubarHighlight,
  menubarIds,
  menubarItemClasses,
  menubarItemIconClasses,
  menubarItemLabelClasses,
  menubarItemSlotClasses,
  menubarKeyAction,
  menubarMenuClasses,
  menubarSeparatorClasses,
  menubarShortcutClasses,
  menubarSubmenuArrowClasses,
  menubarSubmenuClasses,
  menubarSubmenuLabel,
  menubarTabStop,
  menubarTriggerClasses,
  menubarTriggerSlotClasses,
  type MenubarMove,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
  useEffectiveSurface,
} from '../common';

export interface PixelMenubarItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect?: () => void;
  submenu?: PixelMenubarItem[];
  separator?: boolean;
  disabled?: boolean;
}

export interface PixelMenubarMenu {
  label: string;
  items: PixelMenubarItem[];
}

export interface PixelMenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The menus, in order. */
  menus: PixelMenubarMenu[];
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

export const PixelMenubar = forwardRef<HTMLDivElement, PixelMenubarProps>(
  function PixelMenubar(
    { menus, surface: surfaceProp, className, onKeyDown, ...rest },
    forwardedRef,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const ids = menubarIds(useId());

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [activeItem, setActiveItem] = useState<number>(-1);
    const [openSubmenuItem, setOpenSubmenuItem] = useState<number | null>(null);
    const [activeSubItem, setActiveSubItem] = useState<number>(-1);
    // The button that last had focus or a menu open keeps the tab stop.
    const [lastTrigger, setLastTrigger] = useState(0);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef && typeof forwardedRef === 'object') {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    // The open menu takes focus as it mounts, so screen readers follow its
    // aria-activedescendant; the stable callback runs once per menu.
    const setMenuRef = useCallback((node: HTMLDivElement | null) => {
      menuRef.current = node;
      node?.focus({ preventScroll: true });
    }, []);

    const closeAll = useCallback(() => {
      setOpenMenu(null);
      setActiveItem(-1);
      setOpenSubmenuItem(null);
      setActiveSubItem(-1);
    }, []);

    // Closing from inside the open menu (Escape, choosing an item) hands
    // focus back to its button; a press outside leaves focus to the pointer.
    const closeToTrigger = () => {
      if (openMenu !== null && menuRef.current?.contains(document.activeElement)) {
        triggerRefs.current[openMenu]?.focus();
      }
      closeAll();
    };

    const openMenuAt = useCallback(
      (idx: number, move: MenubarMove = 'first') => {
        const menu = menus[idx];
        if (!menu) return;
        setOpenMenu(idx);
        setLastTrigger(idx);
        setActiveItem(menubarHighlight(menu.items, -1, move));
        setOpenSubmenuItem(null);
        setActiveSubItem(-1);
      },
      [menus],
    );

    // Click outside closes all
    useEffect(() => {
      if (openMenu === null) return;
      const listener = (e: PointerEvent) => {
        const target = e.target as Node | null;
        if (!target) return;
        if (rootRef.current?.contains(target)) return;
        closeAll();
      };
      document.addEventListener('pointerdown', listener);
      return () => document.removeEventListener('pointerdown', listener);
    }, [openMenu, closeAll]);

    const handleTriggerClick = (idx: number) => {
      if (openMenu === idx) {
        closeAll();
      } else {
        openMenuAt(idx);
      }
    };

    const handleTriggerMouseEnter = (idx: number) => {
      if (openMenu !== null && openMenu !== idx) {
        openMenuAt(idx);
      }
    };

    const activateItem = (item: PixelMenubarItem) => {
      if (item.disabled || item.separator) return;
      if (menubarHasSubmenu(item)) return;
      item.onSelect?.();
      closeToTrigger();
    };

    const handleRootKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const items = openMenu === null ? [] : menus[openMenu]?.items ?? [];
      const highlighted = items[activeItem];
      const submenu = openSubmenuItem === null ? [] : items[openSubmenuItem]?.submenu ?? [];
      const action = menubarKeyAction(e.key, {
        open: openMenu !== null,
        onSubmenuParent: menubarHasSubmenu(highlighted),
        submenuOpen: openSubmenuItem !== null,
        inSubmenu: openSubmenuItem !== null && activeSubItem >= 0,
      });
      if (!action) return;

      if (action.type === 'leave') {
        // Focus is back on the button before the browser's own Tab, which
        // then moves on from there.
        if (openMenu !== null) triggerRefs.current[openMenu]?.focus();
        closeAll();
        return;
      }
      e.preventDefault();
      const focusedTrigger = triggerRefs.current.indexOf(e.target as HTMLButtonElement);
      switch (action.type) {
        case 'switch': {
          // While every menu is closed, the focused button is the current one.
          const current = openMenu ?? Math.max(0, focusedTrigger);
          openMenuAt((current + action.step + menus.length) % menus.length);
          break;
        }
        case 'open':
          if (focusedTrigger >= 0) openMenuAt(focusedTrigger, action.move);
          break;
        case 'move':
          if (action.level === 'submenu') {
            setActiveSubItem(menubarHighlight(submenu, activeSubItem, action.move));
          } else {
            setActiveItem(menubarHighlight(items, activeItem, action.move));
            setOpenSubmenuItem(null);
            setActiveSubItem(-1);
          }
          break;
        case 'enter':
          setOpenSubmenuItem(activeItem);
          setActiveSubItem(menubarHighlight(highlighted?.submenu ?? [], -1, 'first'));
          break;
        case 'exit':
          setOpenSubmenuItem(null);
          setActiveSubItem(-1);
          break;
        case 'select':
          if (activeSubItem >= 0) {
            const sub = submenu[activeSubItem];
            if (sub && !sub.disabled) {
              sub.onSelect?.();
              closeToTrigger();
            }
          } else if (highlighted) {
            activateItem(highlighted);
          }
          break;
        case 'close':
          closeToTrigger();
          break;
      }
    };

    return (
      <div
        ref={setRefs}
        role="menubar"
        aria-orientation="horizontal"
        onKeyDown={handleRootKeyDown}
        className={cn(menubarClasses(surface), className)}
        {...rest}
      >
        {menus.map((menu, mIdx) => {
          const isOpen = openMenu === mIdx;
          const activeDescendant =
            openSubmenuItem !== null && activeSubItem >= 0
              ? ids.subitem(mIdx, openSubmenuItem, activeSubItem)
              : activeItem >= 0
                ? ids.item(mIdx, activeItem)
                : undefined;
          return (
            <div key={`${menu.label}-${mIdx}`} className={menubarTriggerSlotClasses}>
              <button
                ref={(node) => {
                  triggerRefs.current[mIdx] = node;
                }}
                id={ids.trigger(mIdx)}
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? ids.menu(mIdx) : undefined}
                tabIndex={mIdx === menubarTabStop(openMenu, lastTrigger, menus.length) ? 0 : -1}
                onFocus={() => setLastTrigger(mIdx)}
                onClick={() => handleTriggerClick(mIdx)}
                onMouseEnter={() => handleTriggerMouseEnter(mIdx)}
                className={menubarTriggerClasses(surface, isOpen)}
              >
                {menu.label}
              </button>

              {isOpen && (
                <div
                  ref={setMenuRef}
                  id={ids.menu(mIdx)}
                  role="menu"
                  tabIndex={-1}
                  aria-labelledby={ids.trigger(mIdx)}
                  aria-activedescendant={activeDescendant}
                  className={menubarMenuClasses(surface)}
                >
                  {menu.items.map((item, iIdx) => {
                    if (item.separator) {
                      return (
                        <div
                          key={`sep-${iIdx}`}
                          role="separator"
                          className={menubarSeparatorClasses}
                        />
                      );
                    }

                    const isActive = activeItem === iIdx;
                    const hasSub = menubarHasSubmenu(item);
                    const subOpen = hasSub && openSubmenuItem === iIdx;

                    return (
                      <div
                        key={item.value}
                        className={menubarItemSlotClasses}
                        onMouseEnter={() => {
                          if (item.disabled) return;
                          setActiveItem(iIdx);
                          setActiveSubItem(-1);
                          if (hasSub) setOpenSubmenuItem(iIdx);
                          else setOpenSubmenuItem(null);
                        }}
                      >
                        <div
                          id={ids.item(mIdx, iIdx)}
                          role="menuitem"
                          aria-disabled={item.disabled || undefined}
                          aria-haspopup={hasSub ? 'menu' : undefined}
                          aria-expanded={hasSub ? subOpen : undefined}
                          tabIndex={-1}
                          onClick={() => activateItem(item)}
                          className={menubarItemClasses(surface, { highlighted: isActive, disabled: !!item.disabled })}
                        >
                          {item.icon && (
                            <span className={menubarItemIconClasses}>
                              {item.icon}
                            </span>
                          )}
                          <span className={menubarItemLabelClasses}>{item.label}</span>
                          {item.shortcut && (
                            <kbd className={menubarShortcutClasses(surface)}>
                              {item.shortcut}
                            </kbd>
                          )}
                          {hasSub && (
                            <span aria-hidden className={menubarSubmenuArrowClasses}>
                              {MENUBAR_SUBMENU_ARROW}
                            </span>
                          )}
                        </div>

                        {subOpen && item.submenu && (
                          <div
                            role="menu"
                            aria-label={menubarSubmenuLabel(item.label)}
                            className={menubarSubmenuClasses(surface)}
                          >
                            {item.submenu.map((sub, sIdx) => {
                              if (sub.separator) {
                                return (
                                  <div
                                    key={`sub-sep-${sIdx}`}
                                    role="separator"
                                    className={menubarSeparatorClasses}
                                  />
                                );
                              }
                              return (
                                <div
                                  key={sub.value}
                                  id={ids.subitem(mIdx, iIdx, sIdx)}
                                  role="menuitem"
                                  aria-disabled={sub.disabled || undefined}
                                  tabIndex={-1}
                                  onMouseEnter={() => {
                                    if (!sub.disabled) setActiveSubItem(sIdx);
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (sub.disabled) return;
                                    sub.onSelect?.();
                                    closeToTrigger();
                                  }}
                                  className={menubarItemClasses(surface, {
                                    highlighted: activeSubItem === sIdx,
                                    disabled: !!sub.disabled,
                                    submenu: true,
                                  })}
                                >
                                  {sub.icon && (
                                    <span className={menubarItemIconClasses}>
                                      {sub.icon}
                                    </span>
                                  )}
                                  <span className={menubarItemLabelClasses}>{sub.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);
PixelMenubar.displayName = 'PixelMenubar';
