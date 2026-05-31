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
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
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

type FlatRow =
  | { kind: 'heading'; heading: string; key: string }
  | { kind: 'item'; item: PixelCommandItem; index: number; key: string };

function parseShortcut(shortcut: string): {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
} {
  const parts = shortcut.toLowerCase().split('+').map((s) => s.trim());
  let mod = false;
  let shift = false;
  let alt = false;
  let key = '';
  for (const p of parts) {
    if (p === 'mod' || p === 'cmd' || p === 'ctrl' || p === 'meta') mod = true;
    else if (p === 'shift') shift = true;
    else if (p === 'alt' || p === 'opt' || p === 'option') alt = true;
    else key = p;
  }
  return { key, mod, shift, alt };
}

function matchesShortcut(e: KeyboardEvent, parsed: ReturnType<typeof parseShortcut>): boolean {
  if (e.key.toLowerCase() !== parsed.key) return false;
  const modPressed = e.metaKey || e.ctrlKey;
  if (parsed.mod !== modPressed) return false;
  if (parsed.shift !== e.shiftKey) return false;
  if (parsed.alt !== e.altKey) return false;
  return true;
}

function itemMatches(item: PixelCommandItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.keywords) {
    for (const k of item.keywords) {
      if (k.toLowerCase().includes(q)) return true;
    }
  }
  return false;
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
    const s = surfaceClasses(surface);
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
    const { rows, items } = useMemo(() => {
      const flatRows: FlatRow[] = [];
      const flatItems: PixelCommandItem[] = [];
      let idx = 0;
      for (const g of groups) {
        const visible = g.items.filter((it) => itemMatches(it, query));
        if (visible.length === 0) continue;
        flatRows.push({ kind: 'heading', heading: g.heading, key: `h-${g.heading}` });
        for (const it of visible) {
          flatRows.push({ kind: 'item', item: it, index: idx, key: `i-${it.id}` });
          flatItems.push(it);
          idx += 1;
        }
      }
      return { rows: flatRows, items: flatItems };
    }, [groups, query]);

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
      () => (shortcut ? parseShortcut(shortcut) : null),
      [shortcut],
    );
    useEventListener(
      'keydown',
      (e) => {
        if (!parsedShortcut) return;
        if (matchesShortcut(e, parsedShortcut)) {
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

    const optionIdFor = (id: string) => `${listboxId}-opt-${id}`;
    const activeId = items[highlighted] ? optionIdFor(items[highlighted].id) : undefined;
    const hasListbox = items.length > 0;

    return (
      <PixelPortal>
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[10vh]"
          aria-hidden={false}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <div
            ref={setPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className={cn(
              'relative w-full max-w-lg bg-retro-bg shadow-2xl outline-none',
              s.border,
              s.radiusLg,
              'border-retro-border',
              'flex flex-col overflow-hidden',
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 border-b-2 border-retro-border',
                surface === 'linear' && 'border-b',
              )}
            >
              <span
                aria-hidden
                className={cn('text-retro-muted', s.font, 'text-xs')}
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
                className={cn(
                  'flex-1 bg-transparent text-sm text-retro-text outline-none placeholder:text-retro-muted',
                  s.font,
                )}
              />
            </div>

            {items.length === 0 ? (
              <div
                className={cn(
                  'px-4 py-6 text-center text-xs text-retro-muted',
                  s.font,
                )}
              >
                {emptyMessage}
              </div>
            ) : (
              <ul
                id={listboxId}
                role="listbox"
                className="max-h-[60vh] overflow-y-auto p-1"
              >
                {rows.map((row) => {
                  if (row.kind === 'heading') {
                    return (
                      <li
                        key={row.key}
                        role="presentation"
                        className={cn(
                          'px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-retro-muted',
                          s.font,
                        )}
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
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-retro-text',
                        s.font,
                        s.radius,
                        isActive && 'bg-retro-surface/80 text-retro-text',
                        !isActive && 'hover:bg-retro-surface/40',
                      )}
                    >
                      {it.icon && (
                        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-retro-muted">
                          {it.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.shortcut && (
                        <kbd
                          className={cn(
                            'ml-2 inline-flex items-center gap-0.5 border px-1.5 py-0.5 text-[10px] text-retro-muted',
                            s.border,
                            s.radius,
                            'border-retro-border',
                            s.font,
                          )}
                        >
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
