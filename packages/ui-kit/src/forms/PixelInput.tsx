/* ─────────────────────────────────────────────────────────────────────────
   PixelInput — single-line text input with label/hint/error, icon slot.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import {
  characterCountClasses,
  characterCountText,
  inputClasses,
  inputControlClasses,
  showCountMax,
} from '@pxlkit/ui-kit-core';
import {
  Tone, Size, Surface, cn,
  useEffectiveSurface,
  CloseIcon, FieldShell,
} from '../common';
import { getStringLength } from './_internal/getStringLength';

/** Public prop bag for {@link PixelInput}. */
export interface PixelInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Floating label rendered above the input shell. */
  label?: string;
  /** Helper text shown below the field. Hidden when `error` is set. */
  hint?: string;
  /** Error message shown below the field; flips visual state to invalid. */
  error?: string;
  /** Visual tone for focus ring + border emphasis. Default: `'neutral'`. */
  tone?: Tone;
  /** Field height token. Default: `'md'`. */
  size?: Size;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
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

  const reactId = useId();
  const inputId = rest.id ?? `pxl-input-${reactId}`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : '',
  );
  const currentValue = isControlled ? (value as string | number) : internalValue;
  const valueLen = getStringLength(currentValue);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    if (!isControlled) {
      // The native input owns an uncontrolled value: empty it too, not only
      // the length that drives the counter and this button.
      if (inputRef.current) inputRef.current.value = '';
      setInternalValue('');
    }
    onClear?.();
  };

  // Resolve the effective left/right *inside-shell* slots.
  // `icon` is a legacy alias for `prefix` (left side).
  const leftInside = prefix ?? icon ?? null;
  const isLoading = !!loading;
  const showClear = !!clearable && valueLen > 0 && !disabled && !isLoading;
  const c = inputClasses(surface, size);
  const rightInside = isLoading ? <span aria-hidden className={c.spinner} /> : suffix ?? null;

  const max = showCountMax(showCount);

  const inputEl = (
    <span className={c.shell}>
      {leftInside && <span className={c.leading}>{leftInside}</span>}
      <input
        id={inputId}
        ref={setRefs}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-msg` : undefined}
        value={isControlled ? (value as string | number) : undefined}
        defaultValue={!isControlled ? defaultValue : undefined}
        onChange={handleChange}
        disabled={disabled || isLoading}
        maxLength={max ?? (rest as { maxLength?: number }).maxLength}
        className={cn(
          inputControlClasses(surface, {
            tone,
            size,
            invalid: !!error,
            leading: !!leftInside,
            trailing: isLoading || !!suffix,
            clearButton: showClear,
            addonLeft: !!addonLeft,
            addonRight: !!addonRight,
          }),
          className,
        )}
        {...rest}
      />
      {(showClear || rightInside) && (
        <span className={c.trailing}>
          {showClear && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear input"
              onClick={handleClear}
              className={c.clearButton}
            >
              <CloseIcon className={c.clearIcon} />
            </button>
          )}
          {rightInside && <span className={c.suffix}>{rightInside}</span>}
        </span>
      )}
    </span>
  );

  const shellBody = (addonLeft || addonRight) ? (
    <span className={c.addons}>
      {addonLeft && <span className={c.addonLeft}>{addonLeft}</span>}
      {inputEl}
      {addonRight && <span className={c.addonRight}>{addonRight}</span>}
    </span>
  ) : inputEl;

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={inputId}>
      {shellBody}
      {showCount && (
        <span aria-live="polite" className={characterCountClasses(surface, valueLen, max)}>
          {characterCountText(valueLen, max)}
        </span>
      )}
    </FieldShell>
  );
});
