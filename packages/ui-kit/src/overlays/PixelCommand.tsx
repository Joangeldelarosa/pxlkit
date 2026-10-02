'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  commandClasses,
  commandLayerClasses,
  commandOptionClasses,
  commandOptionId,
  commandRows,
  matchesCommandShortcut,
  parseCommandShortcut,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  useEffectiveSurface,
} from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { OverlayBackdrop } from './_internal/OverlayBackdrop';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useEscape } from '../hooks/useEscape';
import { useScrollLock } from '../hooks/useScrollLock';
import { useEventListener } from '../hooks/useEventListener';

export interface PixelCommandItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}

export interface PixelCommandGroup {
  heading: string;
  items: PixelCommandItem[];
}

export interface PixelCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcut?: string;
  placeholder?: string;
  emptyMessage?: string;
  groups: PixelCommandGroup[];
  surface?: Surface;
}

export const PixelCommand = forwardRef<HTMLDivElement, PixelCommandProps>(
  function PixelCommand(
    {
      open,
      onOpenChange,
      shortcut = 'mod+k',
      placeholder = 'Type a command or search…',
      emptyMessage = 'No results.',
      groups,
      surface: surfaceProp,
    },
    forwardedRef,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const [query, setQuery] = useState('');
    const [highlighted, setHighlighted] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const listboxId = useId();

    const setPanelRef = useCallback(
      (node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef && typeof forwardedRef === 'object') {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    // Filter groups → flat list (items only, for navigation).
    const { rows, items } = useMemo(() => commandRows(groups, query), [groups, query]);

    // Clamp highlighted index when results shrink.
    useEffect(() => {
      if (items.length === 0) {
        if (highlighted !== 0) setHighlighted(0);
        return;
      }
      if (highlighted > items.length - 1) setHighlighted(items.length - 1);
    }, [items.length, highlighted]);

    // Reset query when opening.
    useEffect(() => {
      if (open) {
        setQuery('');
        setHighlighted(0);
      }
    }, [open]);

    // Autofocus input when opened.
    useEffect(() => {
      if (!open) return;
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }, [open]);

    // Global shortcut to toggle open.
    const parsedShortcut = useMemo(
      () => (shortcut ? parseCommandShortcut(shortcut) : null),
      [shortcut],
    );
    useEventListener(
      'keydown',
      (e) => {
        if (!parsedShortcut) return;
        if (matchesCommandShortcut(e, parsedShortcut)) {
          e.preventDefault();
          onOpenChange(!open);
        }
      },
      typeof window !== 'undefined' ? window : null,
    );

    useEscape(() => {
      if (open) onOpenChange(false);
    }, open);

    useScrollLock(open);
    useFocusTrap(open, panelRef);

    const handleInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (items.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted((h) => (h + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((h) => (h - 1 + items.length) % items.length);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlighted(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlighted(items.length - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = items[highlighted];
        if (it) {
          it.onSelect();
        }
      }
    };

    if (!open) return null;

    const optionIdFor = (id: string) => commandOptionId(listboxId, id);
    const c = commandClasses(surface);
    const activeId = items[highlighted] ? optionIdFor(items[highlighted].id) : undefined;
    const hasListbox = items.length > 0;

    return (
      <PixelPortal>
        <div
          className={commandLayerClasses}
          aria-hidden={false}
        >
          <OverlayBackdrop
            position="fixed"
            onClick={() => onOpenChange(false)}
          />
          <div
            ref={setPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className={c.panel}
          >
            <div className={c.search}>
              <span
                aria-hidden
                className={c.prompt}
              >
                {'>'}
              </span>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={hasListbox}
                aria-controls={hasListbox ? listboxId : undefined}
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlighted(0);
                }}
                onKeyDown={handleInputKeyDown}
                className={c.input}
              />
            </div>

            {items.length === 0 ? (
              <div className={c.empty}>
                {emptyMessage}
              </div>
            ) : (
              <ul
                id={listboxId}
                role="listbox"
                className={c.listbox}
              >
                {rows.map((row) => {
                  if (row.kind === 'heading') {
                    return (
                      <li
                        key={row.key}
                        role="presentation"
                        className={c.heading}
                      >
                        {row.heading}
                      </li>
                    );
                  }
                  const it = row.item;
                  const isActive = row.index === highlighted;
                  return (
                    <li
                      key={row.key}
                      id={optionIdFor(it.id)}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setHighlighted(row.index)}
                      onMouseDown={(e) => {
                        // Prevent input blur before click fires.
                        e.preventDefault();
                      }}
                      onClick={() => {
                        it.onSelect();
                      }}
                      className={commandOptionClasses(surface, isActive)}
                    >
                      {it.icon && (
                        <span className={c.icon}>
                          {it.icon}
                        </span>
                      )}
                      <span className={c.label}>{it.label}</span>
                      {it.shortcut && (
                        <kbd className={c.shortcut}>
                          {it.shortcut}
                        </kbd>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </PixelPortal>
    );
  },
);
PixelCommand.displayName = 'PixelCommand';
