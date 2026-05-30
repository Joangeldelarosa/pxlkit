'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Surface,
  cn,
  focusRing,
  inputBase,
  sizeHeight,
  surfaceClasses,
  toneMap,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

/** Public prop bag for {@link PixelOTPInput}. */
export interface PixelOTPInputProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  onComplete?: (full: string) => void;
  mask?: boolean;
  type?: 'numeric' | 'alphanumeric';
  autoFocus?: boolean;
  separator?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  surface?: Surface;
  name?: string;
  disabled?: boolean;
}

const cellSize: Record<NonNullable<PixelOTPInputProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

function sanitize(raw: string, type: 'numeric' | 'alphanumeric'): string {
  if (type === 'numeric') return raw.replace(/[^0-9]/g, '');
  return raw.replace(/[^0-9a-zA-Z]/g, '');
}

export const PixelOTPInput = forwardRef<HTMLInputElement, PixelOTPInputProps>(
  function PixelOTPInput(
    {
      length = 6,
      value,
      defaultValue,
      onChange,
      onComplete,
      mask = false,
      type = 'numeric',
      autoFocus = false,
      separator,
      size = 'md',
      surface: surfaceProp,
      name,
      disabled = false,
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);

    const [val, setVal] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? '',
      onChange,
    });

    const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
    const hiddenRef = useRef<HTMLInputElement>(null);

    // Expose the first cell as the imperative ref (lets parents focus the OTP).
    useImperativeHandle(ref, () => cellRefs.current[0] as HTMLInputElement, []);

    const completedRef = useRef(false);
    useEffect(() => {
      const isFull = val.length === length && length > 0;
      if (isFull && !completedRef.current) {
        completedRef.current = true;
        onComplete?.(val);
      } else if (!isFull) {
        completedRef.current = false;
      }
    }, [val, length, onComplete]);

    useEffect(() => {
      if (autoFocus) cellRefs.current[0]?.focus();
    }, [autoFocus]);

    const chars = useMemo(() => {
      const arr = new Array<string>(length).fill('');
      for (let i = 0; i < Math.min(val.length, length); i++) {
        arr[i] = val[i];
      }
      return arr;
    }, [val, length]);

    const setCharAt = useCallback(
      (index: number, ch: string): string => {
        const next = chars.slice();
        next[index] = ch;
        // Compact trailing empties off the end but preserve internal gaps.
        const joined = next.join('');
        setVal(joined);
        return joined;
      },
      [chars, setVal],
    );

    const focusCell = useCallback((index: number) => {
      const target = cellRefs.current[index];
      if (target) {
        target.focus();
        // Place caret at end so further typing replaces cleanly.
        try {
          target.setSelectionRange(target.value.length, target.value.length);
        } catch {
          /* some input types don't support selectionRange — safe to ignore */
        }
      }
    }, []);

    const handleChange = useCallback(
      (index: number, raw: string) => {
        // Take just the last entered char (handles fast typing where the
        // previous value is still present when the new key lands).
        const cleaned = sanitize(raw, type);
        if (!cleaned) {
          // Reject — clear cell visually by writing the prior value back.
          setCharAt(index, '');
          return;
        }
        const ch = cleaned.slice(-1);
        const joined = setCharAt(index, ch);
        if (index < length - 1) {
          focusCell(index + 1);
        }
        // onComplete handled by effect once `val` is committed.
        void joined;
      },
      [type, setCharAt, length, focusCell],
    );

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
          if (chars[index]) {
            // Clear current cell.
            setCharAt(index, '');
            e.preventDefault();
            return;
          }
          if (index > 0) {
            // Move back AND clear the previous cell.
            setCharAt(index - 1, '');
            focusCell(index - 1);
            e.preventDefault();
          }
          return;
        }
        if (e.key === 'ArrowLeft' && index > 0) {
          focusCell(index - 1);
          e.preventDefault();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
          focusCell(index + 1);
          e.preventDefault();
        } else if (e.key === 'Home') {
          focusCell(0);
          e.preventDefault();
        } else if (e.key === 'End') {
          focusCell(length - 1);
          e.preventDefault();
        }
      },
      [chars, setCharAt, focusCell, length],
    );

    const handlePaste = useCallback(
      (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const data = e.clipboardData?.getData?.('text') ?? '';
        const cleaned = sanitize(data, type);
        if (!cleaned) return;

        const next = chars.slice();
        let cursor = index;
        for (const ch of cleaned) {
          if (cursor >= length) break;
          next[cursor] = ch;
          cursor++;
        }
        const joined = next.join('');
        setVal(joined);
        const focusIndex = Math.min(cursor, length - 1);
        // Defer focus until React has flushed the value into the cells.
        requestAnimationFrame(() => focusCell(focusIndex));
      },
      [chars, setVal, type, length, focusCell],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // Select the cell content so the next keystroke replaces it.
        try {
          e.currentTarget.select();
        } catch {
          /* noop */
        }
      },
      [],
    );

    const inputMode = type === 'numeric' ? 'numeric' : 'text';
    const pattern = type === 'numeric' ? '[0-9]*' : '[0-9a-zA-Z]*';

    return (
      <div
        role="group"
        aria-label="One-time passcode"
        className={cn('inline-flex items-center', s.font)}
      >
        {Array.from({ length }).map((_, i) => {
          const ch = chars[i] ?? '';
          const isLast = i === length - 1;
          return (
            <React.Fragment key={i}>
              <input
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                data-pxl-otp-cell="true"
                data-pxl-otp-index={i}
                type={mask ? 'password' : 'text'}
                inputMode={inputMode}
                pattern={pattern}
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                disabled={disabled}
                value={ch}
                aria-label={`Digit ${i + 1} of ${length}`}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={(e) => handlePaste(i, e)}
                onFocus={handleFocus}
                className={cn(
                  inputBase,
                  s.font,
                  s.border,
                  s.radius,
                  s.transition,
                  cellSize[size],
                  sizeHeight[size].replace(/h-\S+\s?/, ''), // keep text-size token only
                  focusRing,
                  toneMap.neutral.ring,
                  'text-center px-0 border-retro-border-strong',
                  'mx-0.5 first:ml-0 last:mr-0',
                )}
              />
              {separator && !isLast ? (
                <span
                  aria-hidden
                  className="mx-1 inline-flex items-center text-retro-muted select-none"
                >
                  {separator}
                </span>
              ) : null}
            </React.Fragment>
          );
        })}
        {name ? (
          <input
            ref={hiddenRef}
            type="hidden"
            name={name}
            value={val}
            readOnly
          />
        ) : null}
      </div>
    );
  },
);

PixelOTPInput.displayName = 'PixelOTPInput';
