'use client';

import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  clampNumber,
  formatNumberInput,
  numberInputAtLimit,
  numberInputClasses,
  parseNumberInput,
  settleNumberInput,
  stepNumberInput,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  Tone,
  cn,
  useEffectiveSurface,
  FieldShell,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

type NumSize = 'sm' | 'md' | 'lg';

export interface PixelNumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'size'
  > {
  value?: number;
  defaultValue?: number;
  onChange?: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  clampBehavior?: 'strict' | 'blur' | 'none';
  prefix?: string;
  suffix?: string;
  thousandsSeparator?: string;
  allowNegative?: boolean;
  hideControls?: boolean;
  size?: NumSize;
  surface?: Surface;
  tone?: Tone;
  label?: string;
  hint?: string;
  error?: string;
}

export const PixelNumberInput = forwardRef<HTMLInputElement, PixelNumberInputProps>(
  function PixelNumberInput(
    {
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      clampBehavior = 'blur',
      prefix,
      suffix,
      thousandsSeparator,
      allowNegative = true,
      hideControls = false,
      size = 'md',
      surface: surfaceProp,
      tone = 'neutral',
      label,
      hint,
      error,
      className,
      disabled,
      name,
      id,
      placeholder,
      onBlur,
      onFocus,
      onKeyDown,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);

    const initial: number | undefined =
      value !== undefined ? value : defaultValue;

    // Single source-of-truth for the numeric model.
    const [current, setCurrent] = useControllableState<number | undefined>({
      value,
      defaultValue: initial,
      onChange: (next) => {
        if (typeof next === 'number' && !Number.isNaN(next)) onChange?.(next);
      },
    });

    // Display string — what the user actually sees. Decoupled while focused
    // so partial inputs like "" or "-" don't snap back.
    const [display, setDisplay] = useState<string>(() =>
      formatNumberInput(current, precision, thousandsSeparator),
    );
    const focusedRef = useRef(false);

    // Keep display in sync with controlled `current` when not focused.
    useEffect(() => {
      if (!focusedRef.current) {
        setDisplay(formatNumberInput(current, precision, thousandsSeparator));
      }
    }, [current, precision, thousandsSeparator]);

    const commit = useCallback(
      (next: number | undefined) => {
        setCurrent(next as number);
      },
      [setCurrent],
    );

    const bump = useCallback(
      (direction: 1 | -1) => {
        if (disabled) return;
        const next = stepNumberInput(current, direction, step, { min, max, precision });
        commit(next);
        // The display does not follow the value while focused, so a step
        // taken from the keyboard shows its result itself.
        if (focusedRef.current) setDisplay(formatNumberInput(next, precision, thousandsSeparator));
      },
      [current, disabled, step, min, max, precision, thousandsSeparator, commit],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { text, num } = parseNumberInput(e.target.value, thousandsSeparator, allowNegative);
      // Always reflect what the user typed (after minus-strip / separator-strip)
      setDisplay(text);

      if (num === undefined) {
        // partial input — don't fire onChange yet
        return;
      }

      let next = num;
      if (clampBehavior === 'strict') {
        next = clampNumber(next, min, max);
        // sync display if clamp actually moved the value
        if (next !== num) {
          setDisplay(formatNumberInput(next, precision, thousandsSeparator));
        }
      }
      commit(next);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = false;
      if (typeof current === 'number') {
        const next = settleNumberInput(current, clampBehavior, { min, max, precision });
        if (next !== current) commit(next);
        setDisplay(formatNumberInput(next, precision, thousandsSeparator));
      } else {
        setDisplay('');
      }
      onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = true;
      onFocus?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        bump(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        bump(-1);
      }
      onKeyDown?.(e);
    };

    const reactId = useId();
    const inputId = id ?? `pxl-number-${reactId}`;
    const c = numberInputClasses(surface, {
      tone,
      size,
      invalid: !!error,
      prefix: !!prefix,
      suffix: !!suffix,
      hideControls,
    });

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={inputId}>
        <span className={c.shell}>
          {prefix && (
            <span aria-hidden className={c.prefix}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            role="spinbutton"
            aria-valuemin={typeof min === 'number' ? min : undefined}
            aria-valuemax={typeof max === 'number' ? max : undefined}
            aria-valuenow={typeof current === 'number' ? current : undefined}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
            placeholder={placeholder}
            value={display}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className={cn(c.input, className)}
            {...rest}
          />
          {suffix && (
            <span aria-hidden className={c.suffix}>
              {suffix}
            </span>
          )}
          {!hideControls && (
            <span className={c.controls}>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Increment"
                disabled={disabled || numberInputAtLimit(current, 1, { min, max })}
                onClick={() => bump(1)}
                className={c.stepper}
              >
                ▲
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Decrement"
                disabled={disabled || numberInputAtLimit(current, -1, { min, max })}
                onClick={() => bump(-1)}
                className={c.stepper}
              >
                ▼
              </button>
            </span>
          )}
          {/* Hidden mirror for native form serialization. */}
          {name && (
            <input
              type="hidden"
              name={name}
              value={typeof current === 'number' ? String(current) : ''}
            />
          )}
        </span>
      </FieldShell>
    );
  },
);

PixelNumberInput.displayName = 'PixelNumberInput';
