/* ─────────────────────────────────────────────────────────────────────────
   PixelSelect — fully custom dropdown with keyboard nav. No native <select>.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useRef, useState } from 'react';
import {
  Tone, Size, Surface, Option, cn, useClickOutside,
  toneMap, focusRing, sizeHeight, surfaceClasses, useEffectiveSurface,
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
  const s = surfaceClasses(surface);
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
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Tab') { setOpen(false); return; /* allow default Tab */ }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && highlighted >= 0) { handleSelect(options[highlighted].value); }
      else { setOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); setHighlighted(0); return; }
      setHighlighted((p) => Math.min(p + 1, options.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((p) => Math.max(p - 1, 0));
    }
    if (e.key === 'Home') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlighted(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlighted(options.length - 1);
    }
  };

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <div ref={containerRef} className="relative">
        {name && <input type="hidden" name={name} value={value} required={required} />}
        <button
          ref={ref}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between bg-retro-surface/40 px-3 outline-none',
            s.font, s.border, s.radius, s.transition,
            sizeHeight[size], focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border-strong',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={!disabled ? handleKeyDown : undefined}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.icon && <span className="flex-shrink-0 opacity-80">{selected.icon}</span>}
            <span className={cn('truncate', selected ? 'text-retro-text' : 'text-retro-muted')}>{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDownIcon className={cn('ml-2 flex-shrink-0 text-retro-muted transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div role="listbox" className={cn('absolute left-0 top-full z-40 mt-1 w-full bg-retro-bg p-1 shadow-xl', s.border, s.radiusLg, 'border-retro-border-strong')}>
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  'flex w-full items-center px-3 py-2 text-left text-xs transition-colors',
                  s.font, s.radius,
                  opt.value === value ? cn(toneMap[tone].text, toneMap[tone].soft) : 'text-retro-muted',
                  idx === highlighted && 'bg-retro-surface',
                  'hover:bg-retro-surface hover:text-retro-text',
                )}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => handleSelect(opt.value)}
              >
                <span className="flex flex-1 min-w-0 items-center gap-2">
                  {opt.icon && <span className="flex-shrink-0 opacity-80">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </span>
                {opt.value === value && <CheckIcon className="ml-auto flex-shrink-0 h-2.5 w-2.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldShell>
  );
});
