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
  clampHighlight,
  comboboxClasses,
  comboboxKeydown,
  comboboxListboxId,
  comboboxOptionClasses,
  comboboxOptionId,
  comboboxRows,
  fieldDescribedBy,
  fieldMessageId,
  filterComboboxOptions,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  useEffectiveSurface,
  FieldShell, ChevronDownIcon, CheckIcon,
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
  /** Selected value; leave unset for an uncontrolled combobox. */
  value?: string;
  /** Initial value while uncontrolled. */
  defaultValue?: string;
  /** Called with the value of the option the user selected. */
  onChange?: (next: string) => void;
  /** The options of the listbox. */
  options: PixelComboboxOption[];
  /** Shows the search field that filters the options. */
  searchable?: boolean;
  /** Text shown while nothing is selected. */
  placeholder?: string;
  /** Shown in place of the listbox when nothing matches the search. */
  emptyMessage?: string;
  /** Disables the combobox and greys out the trigger. */
  disabled?: boolean;
  /** Trigger height. */
  size?: 'sm' | 'md' | 'lg';
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Label rendered above the trigger. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the trigger invalid. */
  error?: string;
  /** Form field name — a hidden input submits the value. */
  name?: string;
  /** `id` of the trigger; generated when left out. */
  id?: string;
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
    const listboxId = comboboxListboxId(reactId);
    const triggerId = id ?? `${reactId}-trigger`;

    const filtered = useMemo(() => filterComboboxOptions(options, query), [options, query]);
    const { rows, items } = useMemo(() => comboboxRows(filtered), [filtered]);

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

    // Keep the highlight on a listed option as the filter narrows the list.
    useEffect(() => {
      const clamped = clampHighlight(highlighted, items.length);
      if (clamped !== highlighted) setHighlighted(clamped);
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

    // Shared by the trigger, the search field and the listbox: ArrowDown,
    // ArrowUp and Enter open the popup while closed (APG combobox).
    const handleKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
      const action = comboboxKeydown(e.key, { open, highlighted, count: items.length });
      if (!action) return;
      e.preventDefault();
      if (action.kind === 'open') handleOpenChange(true);
      else if (action.kind === 'highlight') setHighlighted(action.index);
      else if (action.kind === 'select') commitSelect(items[action.index]!);
    };

    const activeId = items[highlighted] ? comboboxOptionId(listboxId, items[highlighted].value) : undefined;
    const classes = comboboxClasses(surface, { size, invalid: !!error, disabled, open, hasValue: !!selected });

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={triggerId} messageId={fieldMessageId(triggerId)}>
        <div className={classes.container}>
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
                aria-describedby={fieldDescribedBy(triggerId, { hint, error })}
                disabled={disabled}
                onKeyDown={handleKeyDown}
                className={classes.trigger}
              >
                <span className={classes.value}>
                  {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon className={classes.chevron} />
              </button>
            </PixelPopover.Trigger>
            <PixelPopover.Content
              className={classes.content}
              style={{ minWidth: '12rem' }}
            >
              {searchable && (
                <div className={classes.search}>
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
                    className={classes.input}
                    placeholder="Search…"
                  />
                </div>
              )}
              {items.length === 0 ? (
                <div className={classes.empty}>
                  {emptyMessage}
                </div>
              ) : (
                <ul
                  id={listboxId}
                  role="listbox"
                  className={classes.listbox}
                  onKeyDown={!searchable ? handleKeyDown : undefined}
                  tabIndex={!searchable ? 0 : undefined}
                >
                  {rows.map((row) => {
                    if (row.kind === 'heading') {
                      return (
                        <li
                          key={row.key}
                          role="presentation"
                          className={classes.heading}
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
                        id={comboboxOptionId(listboxId, opt.value)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled || undefined}
                        onMouseEnter={() => setHighlighted(row.index)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => commitSelect(opt)}
                        className={comboboxOptionClasses(surface, { highlighted: isActive, disabled: !!opt.disabled })}
                      >
                        <span className={classes.label}>{opt.label}</span>
                        {isSelected && (
                          <CheckIcon className={classes.check} />
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
