/* ─────────────────────────────────────────────────────────────────────────
   PixelInput — single-line text input with label/hint/error, icon slot.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useId, useState } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, focusRing, inputBase, sizeHeight, surfaceClasses, useEffectiveSurface,
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

function InputSpinner({ className }: { className?: string }) {
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

  const reactId = useId();
  const inputId = rest.id ?? `pxl-input-${reactId}`;

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
  const rightInside = isLoading ? <InputSpinner /> : suffix ?? null;

  // Padding decisions based on which slots are filled.
  // Reserve ~2.5rem (pl-10/pr-10) per occupied side; both clear+suffix share the right side.
  const hasLeft = !!leftInside;
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
    <span className="relative block w-full min-w-0">
      {leftInside && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0">
          {leftInside}
        </span>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-msg` : undefined}
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
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={inputId}>
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
