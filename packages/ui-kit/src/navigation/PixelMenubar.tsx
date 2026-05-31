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
  Surface,
  cn,
  surfaceClasses,
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
  menus: PixelMenubarMenu[];
  surface?: Surface;
}

/** Index of a real (non-separator, enabled) item among items in a menu. */
function firstFocusableIndex(items: PixelMenubarItem[]): number {
  for (let i = 0; i < items.length; i += 1) {
    const it = items[i];
    if (!it.separator && !it.disabled) return i;
  }
  return -1;
}

function nextFocusableIndex(items: PixelMenubarItem[], from: number, dir: 1 | -1): number {
  const n = items.length;
  if (n === 0) return -1;
  let i = from;
  for (let step = 0; step < n; step += 1) {
    i = (i + dir + n) % n;
    const it = items[i];
    if (!it.separator && !it.disabled) return i;
  }
  return from;
}

export const PixelMenubar = forwardRef<HTMLDivElement, PixelMenubarProps>(
  function PixelMenubar(
    { menus, surface: surfaceProp, className, onKeyDown, ...rest },
    forwardedRef,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const baseId = useId();

    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [activeItem, setActiveItem] = useState<number>(-1);
    const [openSubmenuItem, setOpenSubmenuItem] = useState<number | null>(null);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

    const closeAll = useCallback(() => {
      setOpenMenu(null);
      setActiveItem(-1);
      setOpenSubmenuItem(null);
    }, []);

    const openMenuAt = useCallback(
      (idx: number) => {
        const menu = menus[idx];
        if (!menu) return;
        setOpenMenu(idx);
        setActiveItem(firstFocusableIndex(menu.items));
        setOpenSubmenuItem(null);
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
      if (item.submenu && item.submenu.length > 0) return;
      item.onSelect?.();
      closeAll();
    };

    const handleRootKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      // Escape closes any open menu
      if (e.key === 'Escape') {
        if (openMenu !== null) {
          e.preventDefault();
          closeAll();
        }
        return;
      }

      // Horizontal navigation between top-level menus
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // If a submenu parent is active and Right is pressed → open submenu
        if (
          e.key === 'ArrowRight' &&
          openMenu !== null &&
          activeItem >= 0 &&
          menus[openMenu]?.items[activeItem]?.submenu
        ) {
          e.preventDefault();
          setOpenSubmenuItem(activeItem);
          return;
        }
        // If submenu is open and Left is pressed → close submenu
        if (e.key === 'ArrowLeft' && openSubmenuItem !== null) {
          e.preventDefault();
          setOpenSubmenuItem(null);
          return;
        }
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const current = openMenu ?? 0;
        const next = (current + dir + menus.length) % menus.length;
        openMenuAt(next);
        // Move focus to the new trigger
        triggerRefs.current[next]?.focus();
        return;
      }

      // Vertical navigation within current menu
      if (openMenu !== null) {
        const items = menus[openMenu].items;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const from = activeItem < 0 ? -1 : activeItem;
          setActiveItem(nextFocusableIndex(items, from, 1));
          setOpenSubmenuItem(null);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const from = activeItem < 0 ? items.length : activeItem;
          setActiveItem(nextFocusableIndex(items, from, -1));
          setOpenSubmenuItem(null);
          return;
        }
        if (e.key === 'Home') {
          e.preventDefault();
          setActiveItem(firstFocusableIndex(items));
          return;
        }
        if (e.key === 'End') {
          e.preventDefault();
          // last focusable
          let last = -1;
          for (let i = items.length - 1; i >= 0; i -= 1) {
            if (!items[i].separator && !items[i].disabled) {
              last = i;
              break;
            }
          }
          setActiveItem(last);
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          if (activeItem >= 0) {
            const item = items[activeItem];
            if (item.submenu && item.submenu.length > 0) {
              e.preventDefault();
              setOpenSubmenuItem(activeItem);
              return;
            }
            e.preventDefault();
            activateItem(item);
          }
        }
      }
    };

    const triggerId = (idx: number) => `${baseId}-trigger-${idx}`;
    const menuId = (idx: number) => `${baseId}-menu-${idx}`;
    const itemId = (mIdx: number, iIdx: number) => `${baseId}-item-${mIdx}-${iIdx}`;

    return (
      <div
        ref={setRefs}
        role="menubar"
        aria-orientation="horizontal"
        onKeyDown={handleRootKeyDown}
        className={cn(
          'relative inline-flex items-center gap-0.5 p-1',
          s.border,
          s.radius,
          'border-retro-border bg-retro-bg',
          className,
        )}
        {...rest}
      >
        {menus.map((menu, mIdx) => {
          const isOpen = openMenu === mIdx;
          return (
            <div key={`${menu.label}-${mIdx}`} className="relative">
              <button
                ref={(node) => {
                  triggerRefs.current[mIdx] = node;
                }}
                id={triggerId(mIdx)}
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? menuId(mIdx) : undefined}
                tabIndex={openMenu === null ? (mIdx === 0 ? 0 : -1) : isOpen ? 0 : -1}
                onClick={() => handleTriggerClick(mIdx)}
                onMouseEnter={() => handleTriggerMouseEnter(mIdx)}
                className={cn(
                  'px-3 py-1.5 text-xs text-retro-text outline-none',
                  s.font,
                  s.radius,
                  'hover:bg-retro-surface/60',
                  'focus-visible:ring-2 focus-visible:ring-retro-border/60',
                  isOpen && 'bg-retro-surface/80',
                )}
              >
                {menu.label}
              </button>

              {isOpen && (
                <div
                  id={menuId(mIdx)}
                  role="menu"
                  aria-labelledby={triggerId(mIdx)}
                  aria-activedescendant={
                    activeItem >= 0 ? itemId(mIdx, activeItem) : undefined
                  }
                  className={cn(
                    'absolute left-0 top-full z-50 mt-1 min-w-48 bg-retro-bg p-1 shadow-xl',
                    s.border,
                    s.radiusLg,
                    'border-retro-border',
                  )}
                >
                  {menu.items.map((item, iIdx) => {
                    if (item.separator) {
                      return (
                        <div
                          key={`sep-${iIdx}`}
                          role="separator"
                          className="my-1 h-px bg-retro-border/60"
                        />
                      );
                    }

                    const isActive = activeItem === iIdx;
                    const hasSub = !!item.submenu && item.submenu.length > 0;
                    const subOpen = hasSub && openSubmenuItem === iIdx;

                    return (
                      <div
                        key={item.value}
                        className="relative"
                        onMouseEnter={() => {
                          if (item.disabled) return;
                          setActiveItem(iIdx);
                          if (hasSub) setOpenSubmenuItem(iIdx);
                          else setOpenSubmenuItem(null);
                        }}
                      >
                        <div
                          id={itemId(mIdx, iIdx)}
                          role="menuitem"
                          aria-disabled={item.disabled || undefined}
                          aria-haspopup={hasSub ? 'menu' : undefined}
                          aria-expanded={hasSub ? subOpen : undefined}
                          tabIndex={-1}
                          onClick={() => activateItem(item)}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-xs text-retro-text',
                            s.font,
                            s.radius,
                            isActive && !item.disabled && 'bg-retro-surface/80',
                            !isActive && !item.disabled && 'hover:bg-retro-surface/40',
                            item.disabled && 'cursor-not-allowed opacity-50',
                          )}
                        >
                          {item.icon && (
                            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-retro-muted">
                              {item.icon}
                            </span>
                          )}
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.shortcut && (
                            <kbd
                              className={cn(
                                'ml-2 inline-flex items-center gap-0.5 border px-1.5 py-0.5 text-[10px] text-retro-muted',
                                s.border,
                                s.radius,
                                'border-retro-border',
                                s.font,
                              )}
                            >
                              {item.shortcut}
                            </kbd>
                          )}
                          {hasSub && (
                            <span aria-hidden className="text-retro-muted">
                              ▸
                            </span>
                          )}
                        </div>

                        {subOpen && item.submenu && (
                          <div
                            role="menu"
                            aria-label={`${item.label} submenu`}
                            className={cn(
                              'absolute left-full top-0 z-50 ml-1 min-w-44 bg-retro-bg p-1 shadow-xl',
                              s.border,
                              s.radiusLg,
                              'border-retro-border',
                            )}
                          >
                            {item.submenu.map((sub, sIdx) => {
                              if (sub.separator) {
                                return (
                                  <div
                                    key={`sub-sep-${sIdx}`}
                                    role="separator"
                                    className="my-1 h-px bg-retro-border/60"
                                  />
                                );
                              }
                              return (
                                <div
                                  key={sub.value}
                                  role="menuitem"
                                  aria-disabled={sub.disabled || undefined}
                                  tabIndex={-1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (sub.disabled) return;
                                    sub.onSelect?.();
                                    closeAll();
                                  }}
                                  className={cn(
                                    'flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-xs text-retro-text',
                                    s.font,
                                    s.radius,
                                    !sub.disabled && 'hover:bg-retro-surface/60',
                                    sub.disabled && 'cursor-not-allowed opacity-50',
                                  )}
                                >
                                  {sub.icon && (
                                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-retro-muted">
                                      {sub.icon}
                                    </span>
                                  )}
                                  <span className="flex-1 truncate">{sub.label}</span>
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
