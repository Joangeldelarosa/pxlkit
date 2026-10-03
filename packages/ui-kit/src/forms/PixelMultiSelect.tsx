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
  comboboxListboxId,
  comboboxOptionId,
  fieldDescribedBy,
  fieldMessageId,
  filterComboboxOptions,
  isMultiSelectFull,
  multiSelectCheckClasses,
  multiSelectClasses,
  multiSelectKeydown,
  multiSelectOptionClasses,
  toggleMultiSelectValue,
} from '@pxlkit/ui-kit-core';
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  FieldShell,
  Surface,
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
    const reactId = useId();
    const triggerId = id ?? `${reactId}-trigger`;
    const listboxId = comboboxListboxId(reactId);

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
    const capReached = isMultiSelectFull(value, max);
    // Unselected options cannot be picked once the cap is reached.
    const isOptionDisabled = (opt: PixelMultiSelectOption) => !!opt.disabled || (!isSelected(opt.value) && capReached);

    const toggle = (v: string) => {
      const next = toggleMultiSelectValue(value, v, max);
      if (next) setValue(next);
    };

    const clear = useCallback(() => {
      setValue([]);
    }, [setValue]);

    const selectedOptions = value
      .map((v) => options.find((o) => o.value === v))
      .filter((o): o is PixelMultiSelectOption => !!o);

    const filtered = useMemo(
      () => (searchable && query ? filterComboboxOptions(options, query) : options),
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
      const clamped = clampHighlight(highlighted, filtered.length);
      if (clamped !== highlighted) setHighlighted(clamped);
    }, [filtered.length, highlighted]);

    const activeId = filtered[highlighted]
      ? comboboxOptionId(listboxId, filtered[highlighted].value)
      : undefined;

    // The trigger and the search field share the keys; Space types in the
    // search field.
    const navigate = (e: ReactKeyboardEvent<HTMLElement>, inSearch = false) => {
      const action = multiSelectKeydown(e.key, {
        open,
        highlighted,
        count: filtered.length,
        canToggle: (index) => !isOptionDisabled(filtered[index]!),
        query,
        selected: value.length,
        inSearch,
      });
      if (!action) return;
      e.preventDefault();
      switch (action.kind) {
        case 'open':
          setOpen(true);
          return;
        case 'highlight':
          setHighlighted(action.index);
          return;
        case 'toggle':
          toggle(filtered[action.index]!.value);
          return;
        case 'removeLast':
          // Convenience: backspace removes the last chip.
          toggle(value[value.length - 1]!);
          return;
        default:
          return;
      }
    };

    const showClear = clearable && value.length > 0;
    const classes = multiSelectClasses(surface, { size, invalid: !!error, open });

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={triggerId} messageId={fieldMessageId(triggerId)}>
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
              aria-describedby={fieldDescribedBy(triggerId, { hint, error })}
              onKeyDown={(e) => navigate(e)}
              className={classes.trigger}
            >
              <span className={classes.values}>
                {selectedOptions.length === 0 ? (
                  <span className={classes.placeholder}>
                    {placeholder}
                  </span>
                ) : (
                  selectedOptions.map((opt) => (
                    <span key={opt.value} className={classes.chip}>
                      {opt.icon && (
                        <span className={classes.icon}>{opt.icon}</span>
                      )}
                      <span className={classes.chipLabel}>{opt.label}</span>
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
                        className={classes.chipRemove}
                      >
                        <CloseIcon className={classes.chipRemoveGlyph} />
                        <span className="sr-only">Remove {opt.label}</span>
                      </span>
                    </span>
                  ))
                )}
              </span>
              <span className={classes.actions}>
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
                    className={classes.clear}
                  >
                    <CloseIcon className={classes.clearGlyph} />
                  </span>
                )}
                <ChevronDownIcon className={classes.chevron} />
              </span>
            </button>
          </PixelPopover.Trigger>
          <PixelPopover.Content
            className={classes.content}
            style={{ minWidth: 220 }}
          >
            {searchable && (
              <div className={classes.search}>
                {/* Focus sits here while it is open: it carries the active option, as the trigger does. */}
                <input
                  ref={searchRef}
                  type="text"
                  role="searchbox"
                  aria-label="Filter options"
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-activedescendant={activeId}
                  autoFocus
                  placeholder="Search…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlighted(0);
                  }}
                  onKeyDown={(e) => navigate(e, true)}
                  className={classes.input}
                />
              </div>
            )}
            <ul
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              className={classes.listbox}
            >
              {filtered.length === 0 ? (
                <li className={classes.empty}>
                  No results.
                </li>
              ) : (
                filtered.map((opt, idx) => {
                  const selected = isSelected(opt.value);
                  const disabled = isOptionDisabled(opt);
                  const isActive = idx === highlighted;
                  return (
                    <li
                      key={opt.value}
                      id={comboboxOptionId(listboxId, opt.value)}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={disabled || undefined}
                      onMouseEnter={() => setHighlighted(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (disabled) return;
                        toggle(opt.value);
                      }}
                      className={multiSelectOptionClasses(surface, { selected, highlighted: isActive, disabled })}
                    >
                      <span className={multiSelectCheckClasses(surface, selected)}>
                        {selected && (
                          <CheckIcon className={classes.checkGlyph} />
                        )}
                      </span>
                      {opt.icon && (
                        <span className={classes.icon}>{opt.icon}</span>
                      )}
                      <span className={classes.label}>{opt.label}</span>
                    </li>
                  );
                })
              )}
            </ul>
            {typeof max === 'number' && (
              <div className={classes.footer}>
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
