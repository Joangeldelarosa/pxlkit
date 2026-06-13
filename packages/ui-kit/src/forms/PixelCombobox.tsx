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
} from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
  FieldShell, ChevronDownIcon, CheckIcon,
  focusRing, inputBase, sizeHeight,
} from '../common';
import { PixelPopover } from '../overlay-foundation/PixelPopover';
import { useControllableState } from '../hooks/useControllableState';

export interface PixelComboboxOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface PixelComboboxProps {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  options: PixelComboboxOption[];
  searchable?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  surface?: Surface;
  label?: string;
  hint?: string;
  error?: string;
  name?: string;
  id?: string;
}

type FlatRow =
  | { kind: 'heading'; heading: string; key: string }
  | { kind: 'item'; option: PixelComboboxOption; index: number; key: string };

function filterOptions(options: PixelComboboxOption[], query: string): PixelComboboxOption[] {
  if (!query) return options;
  const q = query.toLowerCase();
  return options.filter((o) => o.label.toLowerCase().includes(q));
}

function buildRows(options: PixelComboboxOption[]): { rows: FlatRow[]; items: PixelComboboxOption[] } {
  const items: PixelComboboxOption[] = [];
  const rows: FlatRow[] = [];

  const hasGroups = options.some((o) => o.group);
  if (!hasGroups) {
    options.forEach((opt, idx) => {
      items.push(opt);
      rows.push({ kind: 'item', option: opt, index: idx, key: `i-${opt.value}` });
    });
    return { rows, items };
  }

  const groupOrder: string[] = [];
  const grouped = new Map<string, PixelComboboxOption[]>();
  for (const opt of options) {
    const g = opt.group ?? '';
    if (!grouped.has(g)) {
      grouped.set(g, []);
      groupOrder.push(g);
    }
    grouped.get(g)!.push(opt);
  }

  let idx = 0;
  for (const g of groupOrder) {
    if (g) rows.push({ kind: 'heading', heading: g, key: `h-${g}` });
    for (const opt of grouped.get(g)!) {
      items.push(opt);
      rows.push({ kind: 'item', option: opt, index: idx, key: `i-${opt.value}` });
      idx += 1;
    }
  }
  return { rows, items };
}

export const PixelCombobox = forwardRef<HTMLButtonElement, PixelComboboxProps>(
  function PixelCombobox(
    {
      value: controlledValue,
      defaultValue,
      onChange,
      options,
      searchable = true,
      placeholder = 'Select…',
      emptyMessage = 'No results.',
      disabled = false,
      size = 'md',
      surface: surfaceProp,
      label,
      hint,
      error,
      name,
      id,
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);

    const [value, setValue] = useControllableState<string>({
      value: controlledValue,
      defaultValue: defaultValue ?? '',
      onChange,
    });

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlighted, setHighlighted] = useState(0);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const reactId = useId();
    const listboxId = `${reactId}-listbox`;
    const triggerId = id ?? `${reactId}-trigger`;

    const filtered = useMemo(() => filterOptions(options, query), [options, query]);
    const { rows, items } = useMemo(() => buildRows(filtered), [filtered]);

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
      if (!open) {
        setQuery('');
        setHighlighted(0);
      }
    }, [open]);

    useEffect(() => {
      if (open && searchable) {
        const t = setTimeout(() => searchRef.current?.focus(), 0);
        return () => clearTimeout(t);
      }
    }, [open, searchable]);

    useEffect(() => {
      if (items.length === 0) {
        if (highlighted !== 0) setHighlighted(0);
        return;
      }
      if (highlighted > items.length - 1) setHighlighted(items.length - 1);
    }, [items.length, highlighted]);

    const handleOpenChange = useCallback((next: boolean) => {
      if (disabled) return;
      setOpen(next);
    }, [disabled]);

    const commitSelect = useCallback((opt: PixelComboboxOption) => {
      if (opt.disabled) return;
      setValue(opt.value);
      setOpen(false);
    }, [setValue]);

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length === 0) return;
        setHighlighted((h) => (h + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length === 0) return;
        setHighlighted((h) => (h - 1 + items.length) % items.length);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlighted(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlighted(Math.max(0, items.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const it = items[highlighted];
        if (it) commitSelect(it);
      }
    };

    const optionIdFor = (v: string) => `${listboxId}-opt-${v}`;
    const activeId = items[highlighted] ? optionIdFor(items[highlighted].value) : undefined;

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={triggerId}>
        <div className="relative">
          {name && (
            <input
              type="hidden"
              name={name}
              value={value}
              readOnly
            />
          )}
          <PixelPopover
            open={open}
            onOpenChange={handleOpenChange}
            side="bottom"
            align="start"
            sideOffset={4}
            surface={surface}
            haspopup="listbox"
            role="none"
          >
            <PixelPopover.Trigger>
              <button
                ref={ref}
                id={triggerId}
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={listboxId}
                aria-activedescendant={open ? activeId : undefined}
                aria-disabled={disabled || undefined}
                aria-invalid={error ? true : undefined}
                disabled={disabled}
                onKeyDown={(e) => {
                  // ArrowDown/Up open the popup if closed (APG combobox); otherwise
                  // route through the shared list-nav handler.
                  if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    e.preventDefault();
                    handleOpenChange(true);
                    return;
                  }
                  handleKeyDown(e);
                }}
                className={cn(
                  'flex w-full items-center justify-between bg-retro-surface/40 px-3 outline-none',
                  s.font, s.border, s.radius, s.transition,
                  sizeHeight[size], focusRing,
                  error ? 'border-retro-red/60' : 'border-retro-border-strong',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                <span className={cn('min-w-0 truncate', selected ? 'text-retro-text' : 'text-retro-muted')}>
                  {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon className={cn('ml-2 shrink-0 text-retro-muted transition-transform', open && 'rotate-180')} />
              </button>
            </PixelPopover.Trigger>
            <PixelPopover.Content
              className="w-64 p-1"
              style={{ minWidth: '12rem' }}
            >
              {searchable && (
                <div className={cn(
                  'flex items-center gap-2 px-2 py-1 mb-1 border-b border-retro-border',
                  surface === 'pixel' && 'border-b-2',
                )}>
                  <input
                    ref={searchRef}
                    type="text"
                    role="searchbox"
                    aria-label="Filter options"
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-activedescendant={activeId}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setHighlighted(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'w-full bg-transparent text-sm text-retro-text outline-none placeholder:text-retro-muted',
                      s.font,
                    )}
                    placeholder="Search…"
                  />
                </div>
              )}
              {items.length === 0 ? (
                <div className={cn('px-2 py-4 text-center text-xs text-retro-muted', s.font)}>
                  {emptyMessage}
                </div>
              ) : (
                <ul
                  id={listboxId}
                  role="listbox"
                  className="max-h-60 overflow-y-auto"
                  onKeyDown={!searchable ? handleKeyDown : undefined}
                  tabIndex={!searchable ? 0 : undefined}
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
                    const opt = row.option;
                    const isActive = row.index === highlighted;
                    const isSelected = opt.value === value;
                    return (
                      <li
                        key={row.key}
                        id={optionIdFor(opt.value)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled || undefined}
                        onMouseEnter={() => setHighlighted(row.index)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => commitSelect(opt)}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-retro-text',
                          s.font, s.radius,
                          isActive && 'bg-retro-surface/80',
                          !isActive && 'hover:bg-retro-surface/40',
                          opt.disabled && 'opacity-50 cursor-not-allowed',
                        )}
                      >
                        <span className="flex-1 truncate">{opt.label}</span>
                        {isSelected && (
                          <CheckIcon className="shrink-0 text-retro-muted" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </PixelPopover.Content>
          </PixelPopover>
        </div>
      </FieldShell>
    );
  },
);
PixelCombobox.displayName = 'PixelCombobox';
