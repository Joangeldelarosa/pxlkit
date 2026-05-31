'use client';

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  Surface,
  Tone,
  cn,
  focusRing,
  inputBase,
  sizeHeight,
  surfaceClasses,
  toneMap,
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

const NaNGuard = (n: number, fallback: number) => (Number.isFinite(n) ? n : fallback);

function clampValue(value: number, min?: number, max?: number) {
  let next = value;
  if (typeof min === 'number' && next < min) next = min;
  if (typeof max === 'number' && next > max) next = max;
  return next;
}

function formatDisplay(
  value: number | undefined,
  precision: number | undefined,
  thousandsSeparator: string | undefined,
): string {
  if (value === undefined || Number.isNaN(value as number)) return '';
  let text =
    typeof precision === 'number' ? value.toFixed(precision) : String(value);
  if (thousandsSeparator) {
    const [intPart, decPart] = text.split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    text = decPart !== undefined ? `${grouped}.${decPart}` : grouped;
  }
  return text;
}

function parseRaw(
  raw: string,
  thousandsSeparator: string | undefined,
  allowNegative: boolean,
): { text: string; num: number | undefined } {
  let text = raw;
  if (thousandsSeparator) {
    const sep = thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(sep, 'g'), '');
  }
  if (!allowNegative) {
    text = text.replace(/-/g, '');
  }
  // strip anything that isn't digit / minus / decimal point
  text = text.replace(/[^0-9.\-]/g, '');
  if (text === '' || text === '-' || text === '.' || text === '-.') {
    return { text: raw, num: undefined };
  }
  const num = Number(text);
  if (Number.isNaN(num)) return { text: raw, num: undefined };
  return { text, num };
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
    const s = surfaceClasses(surface);

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
      formatDisplay(current, precision, thousandsSeparator),
    );
    const focusedRef = useRef(false);

    // Keep display in sync with controlled `current` when not focused.
    useEffect(() => {
      if (!focusedRef.current) {
        setDisplay(formatDisplay(current, precision, thousandsSeparator));
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
        const base = typeof current === 'number' ? current : (min ?? 0);
        let next = base + direction * step;
        next = clampValue(next, min, max);
        // round to precision when defined, to avoid 0.1 + 0.2 = 0.300...0004
        if (typeof precision === 'number') {
          const factor = Math.pow(10, precision);
          next = Math.round(next * factor) / factor;
        }
        commit(next);
      },
      [current, disabled, step, min, max, precision, commit],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const { text, num } = parseRaw(raw, thousandsSeparator, allowNegative);
      // Always reflect what the user typed (after minus-strip / separator-strip)
      setDisplay(text);

      if (num === undefined) {
        // partial input — don't fire onChange yet
        return;
      }

      let next = num;
      if (clampBehavior === 'strict') {
        next = clampValue(next, min, max);
        // sync display if clamp actually moved the value
        if (next !== num) {
          setDisplay(formatDisplay(next, precision, thousandsSeparator));
        }
      }
      commit(next);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = false;
      let next = current;
      if (typeof next === 'number') {
        if (clampBehavior !== 'none') {
          next = clampValue(next, min, max);
        }
        if (typeof precision === 'number') {
          const factor = Math.pow(10, precision);
          next = Math.round(NaNGuard(next, 0) * factor) / factor;
        }
        if (next !== current) commit(next);
        setDisplay(formatDisplay(next, precision, thousandsSeparator));
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

    const inputId = id ?? (label ? `pxl-number-${name ?? 'input'}` : undefined);

    return (
      <FieldShell label={label} hint={hint} error={error} surface={surface}>
        <span className="relative block">
          {prefix && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0',
                s.font,
              )}
            >
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
            className={cn(
              inputBase,
              s.font,
              s.border,
              s.radius,
              s.transition,
              sizeHeight[size],
              focusRing,
              toneMap[tone].ring,
              error ? 'border-retro-red/60' : 'border-retro-border-strong',
              prefix ? 'pl-8' : 'pl-3',
              hideControls ? (suffix ? 'pr-10' : 'pr-3') : 'pr-16',
              className,
            )}
            {...rest}
          />
          {suffix && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0',
                s.font,
                hideControls ? 'right-3' : 'right-16',
              )}
            >
              {suffix}
            </span>
          )}
          {!hideControls && (
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Increment"
                disabled={disabled || (typeof max === 'number' && typeof current === 'number' && current >= max)}
                onClick={() => bump(1)}
                className={cn(
                  'border border-retro-border-strong bg-retro-surface/60 px-1.5 text-[10px] leading-none text-retro-muted hover:text-retro-text disabled:opacity-40 disabled:cursor-not-allowed',
                  s.font,
                  s.radius,
                  'h-3.5 flex items-center justify-center',
                )}
              >
                ▲
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Decrement"
                disabled={disabled || (typeof min === 'number' && typeof current === 'number' && current <= min)}
                onClick={() => bump(-1)}
                className={cn(
                  'border border-retro-border-strong bg-retro-surface/60 px-1.5 text-[10px] leading-none text-retro-muted hover:text-retro-text disabled:opacity-40 disabled:cursor-not-allowed',
                  s.font,
                  s.radius,
                  'h-3.5 flex items-center justify-center',
                )}
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
