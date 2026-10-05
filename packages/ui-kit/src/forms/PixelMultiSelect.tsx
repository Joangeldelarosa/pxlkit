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
  chipDeleteLabel,
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
  passMultiSelectFocus,
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
  /** The selected values, in the order picked; leave unset for an uncontrolled multi-select. */
  value?: string[];
  /** Initial values while uncontrolled. */
  defaultValue?: string[];
  /** Called with the selected values after every toggle, removal or clear. */
  onChange?: (next: string[]) => void;
  /** The options of the listbox. */
  options: PixelMultiSelectOption[];
  /** Shows a search field that filters the options. */
  searchable?: boolean;
  /** Most values that can be selected. */
  max?: number;
  /** Text shown while nothing is selected. */
  placeholder?: string;
  /** Shows a button that clears the selection while there is one. */
  clearable?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Trigger height. */
  size?: 'sm' | 'md' | 'lg';
  /** Label rendered above the trigger. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the trigger invalid. */
  error?: string;
  /**
   * Hidden-input `name`. Multiple values are serialized as repeated
   * `<input type="hidden" name={name}>` entries; read with
   * `FormData.getAll(name)`.
   */
  name?: string;
  /** `id` of the trigger; generated when left out. */
  id?: string;
}

/*
 * The field the chips, the combobox and the clear button sit in, side by side
 * as a button cannot hold another. It anchors the popover, and a press on it
 * toggles the listbox as one on the combobox does, but for its buttons, which
 * prevent that. The combobox carries the popup's ARIA, so the field leaves
 * out what PixelPopover.Trigger gives it.
 */
type MultiSelectFieldProps = React.HTMLAttributes<HTMLDivElement>;

const MultiSelectField = forwardRef<HTMLDivElement, MultiSelectFieldProps>(
  function MultiSelectField(
    { 'aria-expanded': _expanded, 'aria-haspopup': _haspopup, 'aria-controls': _controls, ...rest },
    ref,
  ) {
    return <div ref={ref} {...rest} />;
  },
);

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
    const valuesRef = useRef<HTMLSpanElement | null>(null);
    const comboboxRef = useRef<HTMLButtonElement | null>(null);
    const setComboboxRef = useCallback(
      (node: HTMLButtonElement | null) => {
        comboboxRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

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

    // The combobox and the search field share the keys; Space types in the
    // search field.
    const navigate = (e: ReactKeyboardEvent<HTMLElement>, inSearch = false) => {
      // Escape closes the popover, which hands focus back to the field: it
      // cannot take it, so focus leaves the search field for the combobox.
      if (e.key === 'Escape' && inSearch) {
        comboboxRef.current?.focus();
        return;
      }
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

    // A press on the field focuses the combobox, which takes the keys.
    const focusCombobox = (e: React.MouseEvent) => {
      if (!e.defaultPrevented) comboboxRef.current?.focus();
    };

    // The remove and clear buttons leave focus where it is under the pointer,
    // as the options do, and keep the field from toggling the listbox; one
    // that holds focus hands it on as it goes.
    const keepFocus = (e: React.MouseEvent) => e.preventDefault();
    const removeChip = (e: React.MouseEvent<HTMLButtonElement>, v: string) => {
      e.preventDefault();
      passMultiSelectFocus(e.currentTarget, valuesRef.current, comboboxRef.current);
      toggle(v);
    };
    const clearSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      passMultiSelectFocus(e.currentTarget, valuesRef.current, comboboxRef.current);
      clear();
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
            <MultiSelectField onClick={focusCombobox} className={classes.field}>
              <span ref={valuesRef} className={classes.values}>
                {selectedOptions.map((opt) => (
                  <span key={opt.value} className={classes.chip}>
                    {opt.icon && (
                      <span className={classes.icon}>{opt.icon}</span>
                    )}
                    <span className={classes.chipLabel}>{opt.label}</span>
                    <button
                      type="button"
                      aria-label={chipDeleteLabel(opt.label)}
                      data-pxl-chip-remove={opt.value}
                      onMouseDown={keepFocus}
                      onClick={(e) => removeChip(e, opt.value)}
                      className={classes.chipRemove}
                    >
                      <CloseIcon className={classes.chipRemoveGlyph} />
                    </button>
                  </span>
                ))}
                <button
                  ref={setComboboxRef}
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
                  {/* The placeholder, or the value the chips before it show. */}
                  {selectedOptions.length === 0 ? (
                    <span className={classes.placeholder}>
                      {placeholder}
                    </span>
                  ) : (
                    <span className="sr-only">
                      {selectedOptions.map((opt) => opt.label).join(', ')}
                    </span>
                  )}
                </button>
              </span>
              <span className={classes.actions}>
                {showClear && (
                  <button
                    type="button"
                    aria-label="Clear selection"
                    onMouseDown={keepFocus}
                    onClick={clearSelection}
                    className={classes.clear}
                  >
                    <CloseIcon className={classes.clearGlyph} />
                  </button>
                )}
                <ChevronDownIcon className={classes.chevron} />
              </span>
            </MultiSelectField>
          </PixelPopover.Trigger>
          <PixelPopover.Content
            className={classes.content}
            style={{ minWidth: 220 }}
          >
            {searchable && (
              <div className={classes.search}>
                {/* Focus sits here while it is open: it carries the active option, as the combobox does. */}
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
