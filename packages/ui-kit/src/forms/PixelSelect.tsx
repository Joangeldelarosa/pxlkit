/* ─────────────────────────────────────────────────────────────────────────
   PixelSelect — fully custom dropdown with keyboard nav. No native <select>.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useId, useRef, useState } from 'react';
import {
  selectClasses,
  selectKeydown,
  selectListboxId,
  selectOptionClasses,
  selectOptionId,
} from '@pxlkit/ui-kit-core';
import {
  Tone, Size, Surface, Option, useClickOutside,
  useEffectiveSurface,
  ChevronDownIcon, CheckIcon, FieldShell,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

/** Public prop bag for {@link PixelSelect}. */
export interface PixelSelectProps {
  /** Floating label rendered above the trigger. */
  label?: string;
  /** Items rendered in the listbox. */
  options: Option[];
  /** Controlled value. Make sure to update via `onChange`. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fires when the user picks an option. */
  onChange?: (value: string) => void;
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
  /** Helper text shown below the field. Hidden when `error` is set. */
  hint?: string;
  /** Error message shown below the field; flips visual state to invalid. */
  error?: string;
  /** Disables interaction + grays out the trigger. */
  disabled?: boolean;
  /** Visual tone for focus ring + selected option. Default: `'neutral'`. */
  tone?: Tone;
  /** Trigger height token. Default: `'md'`. */
  size?: Size;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
  surface?: Surface;
  /** Sets `name` on the hidden serialization input so the value participates in native `<form>` submissions. */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** DOM `id` forwarded to the trigger. */
  id?: string;
  /** `aria-describedby` forwarded to the trigger. */
  'aria-describedby'?: string;
}

export const PixelSelect = forwardRef<HTMLButtonElement, PixelSelectProps>(function PixelSelect(
  {
    label, options,
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder = 'Select...',
    hint, error,
    disabled = false,
    tone = 'neutral',
    size = 'md',
    surface: surfaceProp,
    name, required, id,
    'aria-describedby': ariaDescribedBy,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const reactId = useId();
  const triggerId = id ?? `pxl-select-${reactId}`;
  const [value, setValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue: defaultValue ?? '',
    onChange,
  });
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useClickOutside(containerRef, () => setOpen(false));

  const handleSelect = (v: string) => {
    setValue(v);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const next = selectKeydown(e.key, { open, highlighted }, options.length);
    if (!next) return;
    // Tab keeps its default, so focus moves on as the listbox closes.
    if (next.preventDefault) e.preventDefault();
    if (next.select !== undefined) {
      handleSelect(options[next.select].value);
      return;
    }
    setOpen(next.open);
    setHighlighted(next.highlighted);
  };

  const c = selectClasses(surface, { tone, size, invalid: !!error, disabled, open, hasValue: !!selected });
  // Focus stays on the trigger: it points at the open listbox and at the
  // highlighted option, so screen readers follow the arrow keys.
  const listboxId = selectListboxId(triggerId);
  const activeOptionId = open && options[highlighted] ? selectOptionId(triggerId, highlighted) : undefined;

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={triggerId}>
      <div ref={containerRef} className={c.container}>
        {name && <input type="hidden" name={name} value={value} required={required} />}
        <button
          ref={ref}
          id={triggerId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
          className={c.trigger}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={!disabled ? handleKeyDown : undefined}
        >
          <span className={c.triggerContent}>
            {selected?.icon && <span className={c.icon}>{selected.icon}</span>}
            <span className={c.value}>{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDownIcon className={c.chevron} />
        </button>
        {open && (
          <div id={listboxId} role="listbox" className={c.listbox}>
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                id={selectOptionId(triggerId, idx)}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={selectOptionClasses(surface, {
                  tone,
                  selected: opt.value === value,
                  highlighted: idx === highlighted,
                })}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => handleSelect(opt.value)}
              >
                <span className={c.optionContent}>
                  {opt.icon && <span className={c.icon}>{opt.icon}</span>}
                  <span className={c.optionLabel}>{opt.label}</span>
                </span>
                {opt.value === value && <CheckIcon className={c.check} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldShell>
  );
});
