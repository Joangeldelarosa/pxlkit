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
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  FieldShell,
  Surface,
  cn,
  focusRing,
  inputBase,
  sizeHeight,
  surfaceClasses,
  toneMap,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';
import { PixelPopover } from '../overlay-foundation/PixelPopover';

export interface PixelMultiSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface PixelMultiSelectProps {
  value?: string[];
  defaultValue?: string[];
  onChange?: (next: string[]) => void;
  options: PixelMultiSelectOption[];
  searchable?: boolean;
  max?: number;
  placeholder?: string;
  clearable?: boolean;
  surface?: Surface;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  hint?: string;
  error?: string;
  /**
   * Hidden-input `name`. Multiple values are serialized as repeated
   * `<input type="hidden" name={name}>` entries; read with
   * `FormData.getAll(name)`.
   */
  name?: string;
  id?: string;
}

export const PixelMultiSelect = forwardRef<HTMLButtonElement, PixelMultiSelectProps>(
  function PixelMultiSelect(
    {
      value: controlledValue,
      defaultValue,
      onChange,
      options,
      searchable = false,
      max,
      placeholder = 'Select…',
      clearable = false,
      surface: surfaceProp,
      size = 'md',
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
    const reactId = useId();
    const triggerId = id ?? `${reactId}-trigger`;
    const listboxId = `${reactId}-listbox`;

    const [value, setValue] = useControllableState<string[]>({
      value: controlledValue,
      defaultValue: defaultValue ?? [],
      onChange,
    });

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlighted, setHighlighted] = useState(0);
    const searchRef = useRef<HTMLInputElement | null>(null);

    const isSelected = (v: string) => value.includes(v);
    const capReached = typeof max === 'number' && value.length >= max;

    const toggle = (v: string) => {
      if (isSelected(v)) {
        setValue(value.filter((x) => x !== v));
        return;
      }
      if (capReached) return;
      setValue([...value, v]);
    };

    const clear = useCallback(() => {
      setValue([]);
    }, [setValue]);

    const selectedOptions = value
      .map((v) => options.find((o) => o.value === v))
      .filter((o): o is PixelMultiSelectOption => !!o);

    const filtered = useMemo(
      () =>
        searchable && query
          ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
          : options,
      [options, query, searchable],
    );

    // Reset query + highlight when closing.
    useEffect(() => {
      if (!open) {
        setQuery('');
        setHighlighted(0);
      }
    }, [open]);

    // Clamp highlight when list shrinks.
    useEffect(() => {
      if (filtered.length === 0) {
        if (highlighted !== 0) setHighlighted(0);
        return;
      }
      if (highlighted > filtered.length - 1) setHighlighted(filtered.length - 1);
    }, [filtered.length, highlighted]);

    const optionIdFor = (v: string) => `${listboxId}-opt-${v}`;
    const activeId = filtered[highlighted]
      ? optionIdFor(filtered[highlighted].value)
      : undefined;

    const navigate = (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (filtered.length === 0) return;
        setHighlighted((h) => (h + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (filtered.length === 0) return;
        setHighlighted((h) => (h - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlighted(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlighted(Math.max(0, filtered.length - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!open) {
          e.preventDefault();
          setOpen(true);
          return;
        }
        const it = filtered[highlighted];
        if (it && !it.disabled && !(capReached && !isSelected(it.value))) {
          e.preventDefault();
          toggle(it.value);
        }
      } else if (e.key === 'Backspace' && !query && value.length > 0) {
        // Convenience: backspace on the trigger removes the last chip.
        e.preventDefault();
        const last = value[value.length - 1];
        toggle(last);
      }
    };

    const showClear = clearable && value.length > 0;

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface}>
        {name &&
          value.map((v) => (
            <input key={v} type="hidden" name={name} value={v} />
          ))}
        <PixelPopover
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          align="start"
          sideOffset={6}
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
              aria-controls={listboxId}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-activedescendant={open ? activeId : undefined}
              aria-invalid={error ? true : undefined}
              onKeyDown={navigate}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 outline-none',
                inputBase,
                s.font,
                s.border,
                s.radius,
                s.transition,
                sizeHeight[size],
                focusRing,
                toneMap.neutral.ring,
                error ? 'border-retro-red/60' : 'border-retro-border-strong',
              )}
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                {selectedOptions.length === 0 ? (
                  <span className="truncate text-retro-muted">
                    {placeholder}
                  </span>
                ) : (
                  selectedOptions.map((opt) => (
                    <span
                      key={opt.value}
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px]',
                        s.border,
                        s.radiusFull,
                        toneMap.neutral.border,
                        toneMap.neutral.soft,
                        'text-retro-text',
                      )}
                    >
                      {opt.icon && (
                        <span className="opacity-80">{opt.icon}</span>
                      )}
                      <span className="truncate">{opt.label}</span>
                      {/*
                        Chip-X is rendered as a span (NOT a button) on purpose:
                        nesting a real <button> inside the trigger <button> is
                        invalid HTML. We swallow pointerdown AND click so the
                        outer trigger doesn't toggle the popover spuriously.
                        Keyboard removal: Backspace on the trigger removes the
                        last chip (see navigate()).
                      */}
                      <span
                        role="img"
                        aria-label={`${opt.label} chip`}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggle(opt.value);
                        }}
                        data-pxl-chip-remove={opt.value}
                        aria-hidden="true"
                        className="inline-flex shrink-0 items-center text-retro-muted hover:text-retro-text cursor-pointer"
                      >
                        <CloseIcon className="h-2 w-2" />
                        <span className="sr-only">Remove {opt.label}</span>
                      </span>
                    </span>
                  ))
                )}
              </span>
              <span className="ml-1 flex shrink-0 items-center gap-1">
                {showClear && (
                  // span+role=button for the same nested-button HTML reason.
                  // Stops propagation on both pointer and click so the outer
                  // trigger doesn't toggle the popover.
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label="Clear selection"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clear();
                    }}
                    className="inline-flex items-center text-retro-muted hover:text-retro-text cursor-pointer"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </span>
                )}
                <ChevronDownIcon
                  className={cn(
                    'text-retro-muted transition-transform',
                    open && 'rotate-180',
                  )}
                />
              </span>
            </button>
          </PixelPopover.Trigger>
          <PixelPopover.Content
            className="p-1 w-[var(--pxl-multiselect-w,16rem)]"
            style={{ minWidth: 220 }}
          >
            {searchable && (
              <div
                className={cn(
                  'mb-1 flex items-center px-2 py-1.5 border-b-2 border-retro-border',
                  surface === 'linear' && 'border-b',
                )}
              >
                <input
                  ref={searchRef}
                  type="text"
                  autoFocus
                  placeholder="Search…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlighted(0);
                  }}
                  onKeyDown={navigate}
                  className={cn(
                    'w-full bg-transparent text-xs text-retro-text outline-none placeholder:text-retro-muted',
                    s.font,
                  )}
                />
              </div>
            )}
            <ul
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              className="max-h-60 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <li
                  className={cn(
                    'px-3 py-2 text-center text-xs text-retro-muted',
                    s.font,
                  )}
                >
                  No results.
                </li>
              ) : (
                filtered.map((opt, idx) => {
                  const selected = isSelected(opt.value);
                  const disabled = opt.disabled || (!selected && capReached);
                  const isActive = idx === highlighted;
                  return (
                    <li
                      key={opt.value}
                      id={optionIdFor(opt.value)}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={disabled || undefined}
                      onMouseEnter={() => setHighlighted(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (disabled) return;
                        toggle(opt.value);
                      }}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs text-retro-text',
                        s.font,
                        s.radius,
                        selected
                          ? cn(toneMap.neutral.soft, 'text-retro-text')
                          : 'text-retro-muted',
                        isActive && !disabled && 'bg-retro-surface/60',
                        disabled && 'opacity-50 cursor-not-allowed',
                        !disabled && !isActive && 'hover:bg-retro-surface hover:text-retro-text',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-[14px] w-[14px] shrink-0 items-center justify-center',
                          s.border,
                          s.radius,
                          selected
                            ? cn(
                                toneMap.neutral.border,
                                toneMap.neutral.bg,
                              )
                            : 'border-retro-border-strong bg-retro-bg',
                        )}
                      >
                        {selected && (
                          <CheckIcon className="h-2 w-2 text-retro-text" />
                        )}
                      </span>
                      {opt.icon && (
                        <span className="opacity-80">{opt.icon}</span>
                      )}
                      <span className="flex-1 truncate">{opt.label}</span>
                    </li>
                  );
                })
              )}
            </ul>
            {typeof max === 'number' && (
              <div
                className={cn(
                  'mt-1 px-2 py-1 text-[10px] text-retro-muted',
                  s.font,
                  'border-t-2 border-retro-border',
                  surface === 'linear' && 'border-t',
                )}
              >
                {value.length}/{max} selected
              </div>
            )}
          </PixelPopover.Content>
        </PixelPopover>
      </FieldShell>
    );
  },
);
PixelMultiSelect.displayName = 'PixelMultiSelect';
