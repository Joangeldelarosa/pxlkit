import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  Tone, Size, Surface, Option, cn, useClickOutside,
  toneMap, focusRing, inputBase, sizeHeight, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell,
} from './common';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';

/* ──────────────────────────────────────────────────────────────────────────
   PixelInput — single-line text input with label/hint/error, icon slot.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelInput}. */
export interface PixelInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
  /** Legacy left-icon slot, rendered inside the input shell. Equivalent to `prefix`. */
  icon?: React.ReactNode;
  /** Content rendered INSIDE the input shell on the left (icon or short text). */
  prefix?: React.ReactNode;
  /** Content rendered INSIDE the input shell on the right (icon or short text). */
  suffix?: React.ReactNode;
  /** Element rendered OUTSIDE the input shell and joined to its left edge (e.g. button/select). */
  addonLeft?: React.ReactNode;
  /** Element rendered OUTSIDE the input shell and joined to its right edge. */
  addonRight?: React.ReactNode;
  /** When true, shows a clear (×) button while the value is non-empty. */
  clearable?: boolean;
  /** Callback fired when the clear button is clicked. */
  onClear?: () => void;
  /** Render a character counter under the input. `true` shows `N`; `{ max }` shows `N/max`. */
  showCount?: boolean | { max?: number };
  /** When true, replaces the suffix with a spinner and disables the input. */
  loading?: boolean;
}

function PixelSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-3 w-3 animate-spin border-2 border-retro-muted border-t-transparent rounded-full',
        className,
      )}
    />
  );
}

function getStringLength(v: unknown): number {
  if (typeof v === 'string') return v.length;
  if (typeof v === 'number') return String(v).length;
  return 0;
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(function PixelInput(
  {
    label, hint, error,
    tone = 'neutral', size = 'md',
    surface: surfaceProp,
    icon,
    prefix,
    suffix,
    addonLeft,
    addonRight,
    clearable,
    onClear,
    showCount,
    loading,
    className,
    value,
    defaultValue,
    onChange,
    disabled,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : '',
  );
  const currentValue = isControlled ? (value as string | number) : internalValue;
  const valueLen = getStringLength(currentValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  // Resolve the effective left/right *inside-shell* slots.
  // `icon` is a legacy alias for `prefix` (left side).
  const leftInside = prefix ?? icon ?? null;
  const isLoading = !!loading;
  const showClear = !!clearable && valueLen > 0 && !disabled && !isLoading;
  const rightInside = isLoading ? <PixelSpinner /> : suffix ?? null;

  // Padding decisions based on which slots are filled.
  // Reserve ~2.5rem (pl-10/pr-10) per occupied side; both clear+suffix share the right side.
  const hasLeft = !!leftInside;
  const hasRight = !!rightInside || showClear;
  const padLeft = hasLeft ? 'pl-10' : 'pl-3';
  // If both clear and (suffix OR loading) live on the right we widen padding further.
  const rightSlots = (rightInside ? 1 : 0) + (showClear ? 1 : 0);
  const padRight = rightSlots === 0 ? 'pr-3' : rightSlots === 1 ? 'pr-10' : 'pr-16';

  const max =
    typeof showCount === 'object' && showCount !== null && typeof showCount.max === 'number'
      ? showCount.max
      : undefined;
  const countText = max !== undefined ? `${valueLen}/${max}` : `${valueLen}`;

  const inputEl = (
    <span className="relative block w-full">
      {leftInside && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0">
          {leftInside}
        </span>
      )}
      <input
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${rest.id ?? 'pxl-input'}-msg` : undefined}
        value={isControlled ? (value as string | number) : undefined}
        defaultValue={!isControlled ? defaultValue : undefined}
        onChange={handleChange}
        disabled={disabled || isLoading}
        maxLength={max ?? (rest as { maxLength?: number }).maxLength}
        className={cn(
          inputBase, s.font, s.border, s.radius, s.transition,
          sizeHeight[size], focusRing, toneMap[tone].ring,
          error ? 'border-retro-red/60' : 'border-retro-border-strong',
          padLeft, padRight,
          // When wrapped by addons, kill the rounded corners on the joined edges
          // so the group reads as a single control.
          addonLeft ? 'rounded-l-none' : undefined,
          addonRight ? 'rounded-r-none' : undefined,
          className,
        )}
        {...rest}
      />
      {(showClear || rightInside) && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-retro-muted">
          {showClear && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear input"
              onClick={() => {
                if (!isControlled) setInternalValue('');
                onClear?.();
              }}
              className="inline-flex items-center justify-center text-retro-muted hover:text-retro-text"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          {rightInside && (
            <span className={cn('pointer-events-none inline-flex items-center justify-center shrink-0', s.font)}>
              {rightInside}
            </span>
          )}
        </span>
      )}
    </span>
  );

  const shellBody = (addonLeft || addonRight) ? (
    <span className="flex w-full items-stretch">
      {addonLeft && (
        <span
          className={cn(
            'inline-flex items-center bg-retro-surface/60 px-3 text-retro-muted shrink-0',
            s.font, s.border, s.radius, sizeHeight[size],
            'border-retro-border-strong rounded-r-none border-r-0',
          )}
        >
          {addonLeft}
        </span>
      )}
      {inputEl}
      {addonRight && (
        <span
          className={cn(
            'inline-flex items-center bg-retro-surface/60 px-3 text-retro-muted shrink-0',
            s.font, s.border, s.radius, sizeHeight[size],
            'border-retro-border-strong rounded-l-none border-l-0',
          )}
        >
          {addonRight}
        </span>
      )}
    </span>
  ) : inputEl;

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      {shellBody}
      {showCount && (
        <span
          aria-live="polite"
          className={cn(
            'block text-right text-[10px] text-retro-muted',
            s.font,
            max !== undefined && valueLen > max && 'text-retro-red',
          )}
        >
          {countText}
        </span>
      )}
    </FieldShell>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelPasswordInput — password field with show/hide toggle.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelPasswordInput}. */
export interface PixelPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
  /** Text for the visibility toggle, in `[showLabel, hideLabel]` form. */
  toggleLabels?: [string, string];
}

export const PixelPasswordInput = forwardRef<HTMLInputElement, PixelPasswordInputProps>(function PixelPasswordInput(
  {
    label, hint, error,
    tone = 'neutral', size = 'md',
    surface: surfaceProp,
    toggleLabels = ['Show', 'Hide'],
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <span className="relative block">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          className={cn(
            inputBase, s.font, s.border, s.radius, s.transition,
            sizeHeight[size], focusRing, toneMap[tone].ring,
            error ? 'border-retro-red/60' : 'border-retro-border-strong',
            'px-3 pr-16',
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? toggleLabels[1] : toggleLabels[0]}
          aria-pressed={visible}
          className={cn(
            'absolute right-1.5 top-1/2 -translate-y-1/2 border border-retro-border-strong bg-retro-surface/60 px-2 py-0.5 text-[10px] uppercase text-retro-muted transition-colors hover:text-retro-text disabled:opacity-50 disabled:cursor-not-allowed',
            s.font, s.radius,
          )}
          disabled={rest.disabled}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? toggleLabels[1] : toggleLabels[0]}
        </button>
      </span>
    </FieldShell>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelTextarea — multi-line text input.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelTextarea}. */
export interface PixelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  surface?: Surface;
  /** Auto-grow the textarea with content (between `minRows` and `maxRows`). */
  autosize?: boolean;
  /** Minimum visible rows when `autosize` is on. Defaults to `3`. */
  minRows?: number;
  /** Max rows before scrolling. Optional cap. */
  maxRows?: number;
  /** Render a character counter under the textarea. `true` shows `N`; `{ max }` shows `N/max`. */
  showCount?: boolean | { max?: number };
}

export const PixelTextarea = forwardRef<HTMLTextAreaElement, PixelTextareaProps>(function PixelTextarea(
  {
    label, hint, error,
    tone = 'neutral',
    surface: surfaceProp,
    autosize,
    minRows = 3,
    maxRows,
    showCount,
    className,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : '',
  );
  const currentValue = isControlled ? (value as string | number) : internalValue;
  const valueLen = getStringLength(currentValue);

  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    },
    [ref],
  );

  const resize = useCallback(() => {
    const el = innerRef.current;
    if (!el || !autosize) return;
    // Read line-height to clamp by row count. Fallback to 20 if not measurable.
    const cs = typeof window !== 'undefined' ? window.getComputedStyle(el) : null;
    const lineHeight = cs ? parseFloat(cs.lineHeight) || 20 : 20;
    const padY = cs ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : 0;
    const min = lineHeight * minRows + padY;
    const max = typeof maxRows === 'number' ? lineHeight * maxRows + padY : Infinity;
    // Reset to allow shrink, then read scrollHeight.
    el.style.height = 'auto';
    const next = Math.max(min, Math.min(el.scrollHeight, max));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [autosize, minRows, maxRows]);

  // Resize on mount + when the value changes externally (controlled mode).
  useIsomorphicLayoutEffect(() => {
    resize();
  }, [resize, currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
    // Schedule a resize after React has applied the new value.
    if (autosize) {
      // For uncontrolled mode the value updates synchronously via state; in
      // controlled mode this fires once the parent re-renders. Either way we
      // also resize here for the typed-then-rendered case.
      requestAnimationFrame(resize);
    }
  };

  const max =
    typeof showCount === 'object' && showCount !== null && typeof showCount.max === 'number'
      ? showCount.max
      : undefined;
  const countText = max !== undefined ? `${valueLen}/${max}` : `${valueLen}`;

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <textarea
        ref={setRefs}
        aria-invalid={error ? true : undefined}
        value={isControlled ? (value as string | number) : undefined}
        defaultValue={!isControlled ? defaultValue : undefined}
        onChange={handleChange}
        rows={autosize ? minRows : (rest as { rows?: number }).rows}
        maxLength={max ?? (rest as { maxLength?: number }).maxLength}
        className={cn(
          inputBase, s.font, s.border, s.radius, s.transition,
          focusRing, toneMap[tone].ring,
          autosize ? 'px-3 py-2 text-sm resize-none' : 'min-h-24 px-3 py-2 text-sm',
          error ? 'border-retro-red/60' : 'border-retro-border-strong',
          className,
        )}
        {...rest}
      />
      {showCount && (
        <span
          aria-live="polite"
          className={cn(
            'block text-right text-[10px] text-retro-muted',
            s.font,
            max !== undefined && valueLen > max && 'text-retro-red',
          )}
        >
          {countText}
        </span>
      )}
    </FieldShell>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelSelect — fully custom dropdown with keyboard nav. No native <select>.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSelect}. */
export interface PixelSelectProps {
  label?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
  /** Sets `name` on the hidden serialization input so the value participates in native `<form>` submissions. */
  name?: string;
  required?: boolean;
  id?: string;
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
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = isControlled ? controlledValue : internalValue;
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useClickOutside(containerRef, () => setOpen(false));

  const handleSelect = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
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

/* ──────────────────────────────────────────────────────────────────────────
   PixelCheckbox — chunky pixel check mark.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelCheckbox}. */
export interface PixelCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
  /** Form-serialization name. Hidden mirror input sends `'on'` / `''`. */
  name?: string;
  /** HTML form value when checked. Defaults to `'on'`. */
  value?: string;
  required?: boolean;
  id?: string;
}

export const PixelCheckbox = forwardRef<HTMLButtonElement, PixelCheckboxProps>(function PixelCheckbox(
  {
    label, checked, onChange,
    disabled = false,
    tone = 'green',
    surface: surfaceProp,
    name, value = 'on', required, id,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <>
      {name && checked && <input type="hidden" name={name} value={value} required={required} />}
      <button
        ref={ref}
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'group flex items-center gap-2.5 text-sm outline-none',
          s.font,
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        <span
          className={cn(
            'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
            s.border, s.radius,
            checked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border-strong bg-retro-bg',
            !disabled && 'group-hover:border-retro-muted',
            'group-focus-visible:ring-2 group-focus-visible:ring-retro-green/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg',
          )}
        >
          {checked && <CheckIcon className={toneMap[tone].text} />}
        </span>
        <span className="text-retro-text select-none">{label}</span>
      </button>
    </>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelRadioGroup — grouped radios with pixel dot indicator.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelRadioGroup}. */
export interface PixelRadioGroupProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
  /** Form-serialization name. */
  name?: string;
  required?: boolean;
}

export const PixelRadioGroup = forwardRef<HTMLFieldSetElement, PixelRadioGroupProps>(function PixelRadioGroup(
  {
    label, value, options, onChange,
    disabled = false,
    tone = 'cyan',
    surface: surfaceProp,
    name, required,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <fieldset ref={ref} className="space-y-2" role="radiogroup" aria-disabled={disabled} aria-required={required || undefined}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <legend className={cn('mb-1.5 text-xs text-retro-muted', s.font)}>{label}</legend>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-disabled={disabled}
            // Fix: <fieldset disabled> only cascades to native form controls;
            // <button> children need an explicit `disabled` to be functionally
            // unavailable (not just visually dim).
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            className={cn(
              'group flex items-center gap-2.5 text-sm outline-none',
              s.font,
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
                s.border,
                surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
                isActive ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border-strong bg-retro-bg',
                !disabled && 'group-hover:border-retro-muted',
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    'block h-2 w-2',
                    surface === 'pixel' ? 'rounded-[1px]' : 'rounded-full',
                    toneMap[tone].fill,
                  )}
                />
              )}
            </span>
            <span className="text-retro-text select-none">{opt.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelSwitch — toggle switch with disabled + surface.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSwitch}. */
export interface PixelSwitchProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
  /** Form-serialization name. Hidden mirror sends `'on'` / `''`. */
  name?: string;
  /** HTML form value when checked. Defaults to `'on'`. */
  value?: string;
  required?: boolean;
  id?: string;
}

export const PixelSwitch = forwardRef<HTMLButtonElement, PixelSwitchProps>(function PixelSwitch(
  {
    label, checked, onChange,
    disabled = false,
    tone = 'green',
    surface: surfaceProp,
    name, value = 'on', required, id,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <>
      {name && checked && <input type="hidden" name={name} value={value} required={required} />}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'group inline-flex items-center gap-3 text-sm text-retro-text outline-none',
          s.font, focusRing, toneMap[tone].ring,
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center transition-colors',
            s.border,
            surface === 'pixel' ? 'rounded-[3px]' : 'rounded-full',
            checked ? cn(toneMap[tone].border, toneMap[tone].bg) : 'border-retro-border-strong bg-retro-surface',
          )}
        >
          <span
            className={cn(
              'absolute left-0.5 h-4 w-4 transition-transform',
              surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
              checked ? cn('translate-x-5', toneMap[tone].fill) : 'translate-x-0 bg-retro-muted',
            )}
          />
        </span>
        <span className="select-none">{label}</span>
      </button>
    </>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelSlider — single OR range slider, with marks, tooltips, and ticks.
   - Single mode (default): value is a number, one thumb.
   - Range mode: value is [number, number], two thumbs, fill between.
   ────────────────────────────────────────────────────────────────────────── */

export type PixelSliderTooltip = 'always' | 'drag' | 'never';

/** A labeled mark on the track. */
export interface PixelSliderMark {
  value: number;
  label: React.ReactNode;
}

/** Shared base props for {@link PixelSlider}. */
interface PixelSliderBaseProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  tone?: Tone;
  showMinMax?: boolean;
  surface?: Surface;
  name?: string;
  required?: boolean;
  id?: string;
  /** Labeled marks plotted on the track. */
  marks?: PixelSliderMark[];
  /**
   * When/how to show a value tooltip on each thumb.
   * - `'always'`: visible all the time
   * - `'drag'`: visible while dragging or focused
   * - `'never'`: hidden (default)
   */
  showTooltip?: PixelSliderTooltip;
  /** Render tick marks under the track for every discrete `step`. */
  ticks?: boolean;
}

/** Single-thumb variant. */
export interface PixelSliderSingleProps extends PixelSliderBaseProps {
  value: number;
  onChange: (next: number) => void;
}

/** Range (two-thumb) variant. */
export interface PixelSliderRangeProps extends PixelSliderBaseProps {
  value: [number, number];
  onChange: (next: [number, number]) => void;
}

/** Public prop bag for {@link PixelSlider}. */
export type PixelSliderProps = PixelSliderSingleProps | PixelSliderRangeProps;

function isRangeValue(v: number | [number, number]): v is [number, number] {
  return Array.isArray(v);
}

export const PixelSlider = forwardRef<HTMLDivElement, PixelSliderProps>(function PixelSlider(
  {
    label,
    min = 0, max = 100, step = 1,
    value, onChange,
    disabled = false,
    tone = 'cyan',
    showMinMax = false,
    surface: surfaceProp,
    name, required, id,
    marks,
    showTooltip = 'never',
    ticks = false,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const trackRef = useRef<HTMLDivElement>(null);

  const range = isRangeValue(value);
  const v0 = range ? (value as [number, number])[0] : (value as number);
  const v1 = range ? (value as [number, number])[1] : (value as number);

  // Which thumb is being dragged (0 = single/lower, 1 = upper). null = idle.
  const draggingIdx = useRef<0 | 1 | null>(null);
  const [activeIdx, setActiveIdx] = useState<0 | 1 | null>(null);

  const clamp = useCallback(
    (n: number) => Math.max(min, Math.min(max, n)),
    [min, max],
  );

  const stepRound = useCallback(
    (n: number) => Math.round(n / step) * step,
    [step],
  );

  const emit = useCallback(
    (idx: 0 | 1, next: number) => {
      const clamped = clamp(stepRound(next));
      if (!range) {
        (onChange as (n: number) => void)(clamped);
        return;
      }
      // Range — ensure lower stays ≤ upper.
      const lo = idx === 0 ? Math.min(clamped, v1) : v0;
      const hi = idx === 1 ? Math.max(clamped, v0) : v1;
      (onChange as (n: [number, number]) => void)([lo, hi]);
    },
    [clamp, stepRound, range, onChange, v0, v1],
  );

  const positionRatio = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [],
  );

  const valueFromClientX = useCallback(
    (clientX: number) => min + positionRatio(clientX) * (max - min),
    [min, max, positionRatio],
  );

  const pickNearestIdx = useCallback(
    (clientX: number): 0 | 1 => {
      if (!range) return 0;
      const v = valueFromClientX(clientX);
      return Math.abs(v - v0) <= Math.abs(v - v1) ? 0 : 1;
    },
    [range, v0, v1, valueFromClientX],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      const idx = pickNearestIdx(e.clientX);
      draggingIdx.current = idx;
      setActiveIdx(idx);
      // Capture on the actual element receiving the event so subsequent
      // moves keep firing even when the pointer leaves the track.
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      emit(idx, valueFromClientX(e.clientX));
    },
    [disabled, pickNearestIdx, emit, valueFromClientX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingIdx.current === null || disabled) return;
      emit(draggingIdx.current, valueFromClientX(e.clientX));
    },
    [disabled, emit, valueFromClientX],
  );

  const handlePointerUp = useCallback(() => {
    draggingIdx.current = null;
    setActiveIdx(null);
  }, []);

  const makeKeyDown = (idx: 0 | 1) =>
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const current = idx === 0 ? v0 : v1;
      let next = current;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, current + step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, current - step);
      else if (e.key === 'Home') next = min;
      else if (e.key === 'End') next = max;
      else if (e.key === 'PageUp') next = Math.min(max, current + step * 10);
      else if (e.key === 'PageDown') next = Math.max(min, current - step * 10);
      else return;
      e.preventDefault();
      emit(idx, next);
    };

  const pctOf = (n: number) =>
    Math.max(0, Math.min(100, ((n - min) / (max - min)) * 100));
  const p0 = pctOf(v0);
  const p1 = pctOf(v1);
  const fillLeft = range ? Math.min(p0, p1) : 0;
  const fillRight = range ? Math.max(p0, p1) : p0;
  const fillWidth = fillRight - fillLeft;

  const thumbVisible = (idx: 0 | 1) => {
    if (showTooltip === 'always') return true;
    if (showTooltip === 'never') return false;
    return activeIdx === idx;
  };

  const renderThumb = (idx: 0 | 1, pct: number, val: number) => (
    <React.Fragment key={idx}>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        aria-label={range ? `${label} ${idx === 0 ? 'minimum' : 'maximum'}` : label}
        aria-disabled={disabled}
        aria-required={range ? undefined : required || undefined}
        id={idx === 0 ? id : undefined}
        onKeyDown={makeKeyDown(idx)}
        onFocus={() => setActiveIdx(idx)}
        onBlur={() => setActiveIdx((cur) => (cur === idx ? null : cur))}
        className={cn(
          'absolute top-1/2 h-4 w-4 -translate-y-1/2 border-2 bg-retro-bg shadow-md transition-shadow outline-none',
          surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
          !disabled && 'group-hover:shadow-[0_0_0_3px_rgba(0,0,0,.15)]',
          focusRing, toneMap[tone].ring,
          toneMap[tone].border,
        )}
        style={{ left: `calc(${pct}% - 8px)` }}
      >
        {thumbVisible(idx) && (
          <span
            role="tooltip"
            className={cn(
              'pointer-events-none absolute left-1/2 -top-7 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 text-[10px] text-retro-text bg-retro-bg',
              s.font, s.border, s.radius, 'border-retro-border-strong',
            )}
          >
            {val}
          </span>
        )}
      </div>
    </React.Fragment>
  );

  // Tick positions — every step inside [min,max]. Cap at 50 to avoid
  // pathological DOM bloat when step is too small.
  const tickValues = useMemo(() => {
    if (!ticks) return [];
    const out: number[] = [];
    const count = Math.floor((max - min) / step);
    if (count <= 0) return out;
    const limit = Math.min(count, 50);
    for (let i = 0; i <= limit; i++) {
      out.push(min + (i * (max - min)) / limit);
    }
    return out;
  }, [ticks, min, max, step]);

  const trackBody = (
    <div
      ref={trackRef}
      role={range ? 'group' : undefined}
      aria-label={range ? label : undefined}
      className={cn(
        'group relative h-2.5 outline-none touch-none border border-retro-border-strong bg-retro-surface/50',
        surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={cn(
          'absolute inset-y-0 transition-[width]',
          surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full',
          toneMap[tone].bg,
        )}
        style={{ left: `${fillLeft}%`, width: `${fillWidth}%`, opacity: 0.8 }}
      />
      {renderThumb(0, p0, v0)}
      {range && renderThumb(1, p1, v1)}
    </div>
  );

  const valueLabel = range ? `${v0} – ${v1}` : `${v0}`;

  return (
    <div ref={ref} className={cn('space-y-2', disabled && 'opacity-50')}>
      {name && (
        range ? (
          <>
            <input type="hidden" name={`${name}[0]`} value={v0} required={required} />
            <input type="hidden" name={`${name}[1]`} value={v1} required={required} />
          </>
        ) : (
          <input type="hidden" name={name} value={v0} required={required} />
        )
      )}
      <div className={cn('flex items-center justify-between text-xs text-retro-muted', s.font)}>
        <span>{label}</span>
        <span className={toneMap[tone].text}>{valueLabel}</span>
      </div>
      {trackBody}
      {ticks && tickValues.length > 0 && (
        <div className="relative h-2" aria-hidden>
          {tickValues.map((tv, i) => (
            <span
              key={i}
              data-testid="pxl-slider-tick"
              className={cn('absolute top-0 h-1.5 w-px bg-retro-muted/40')}
              style={{ left: `${pctOf(tv)}%` }}
            />
          ))}
        </div>
      )}
      {marks && marks.length > 0 && (
        <div className="relative h-4" data-testid="pxl-slider-marks">
          {marks.map((m, i) => (
            <span
              key={i}
              className={cn('absolute top-0 -translate-x-1/2 text-[10px] text-retro-muted', s.font)}
              style={{ left: `${pctOf(m.value)}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
      {showMinMax && (
        <div className={cn('flex justify-between text-[10px] text-retro-muted/50', s.font)}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelSegmented — segmented control for toggling between options.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSegmented}. */
export interface PixelSegmentedProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (next: string) => void;
  disabled?: boolean;
  tone?: Tone;
  surface?: Surface;
  /** Form-serialization name. */
  name?: string;
  required?: boolean;
}

export const PixelSegmented = forwardRef<HTMLDivElement, PixelSegmentedProps>(function PixelSegmented(
  {
    label, value, options, onChange,
    disabled = false,
    tone = 'green',
    surface: surfaceProp,
    name, required,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div ref={ref} className={cn('space-y-1.5', disabled && 'opacity-50 cursor-not-allowed')}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <p className={cn('text-xs text-retro-muted', s.font)}>{label}</p>
      <div className={cn('inline-flex bg-retro-surface/50 p-0.5', s.border, s.radius, 'border-retro-border-strong/60')}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isActive}
              aria-disabled={disabled}
              disabled={disabled}
              className={cn(
                'px-3 py-1.5 text-xs outline-none',
                s.font, s.radius, s.transition,
                focusRing, toneMap[tone].ring,
                isActive
                  ? cn(toneMap[tone].bg, toneMap[tone].text, 'border border-transparent shadow-sm')
                  : 'border border-transparent text-retro-muted hover:text-retro-text',
                disabled && 'cursor-not-allowed',
              )}
              onClick={() => !disabled && onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
