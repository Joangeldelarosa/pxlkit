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
  isOtpComplete,
  otpCellLabel,
  otpCells,
  otpGroupLabel,
  otpInputClasses,
  otpInputMode,
  otpKeydown,
  otpPattern,
  pasteOtp,
  typeOtpCell,
  type OtpInputVariant,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

/** Public prop bag for {@link PixelOTPInput}. */
export interface PixelOTPInputProps {
  /** Number of cells. */
  length?: number;
  /** Code; leave unset for an uncontrolled input. */
  value?: string;
  /** Initial code while uncontrolled. */
  defaultValue?: string;
  /** Called with the new code, after every edit. */
  onChange?: (next: string) => void;
  /** Called with the code each time it comes to fill every cell. */
  onComplete?: (full: string) => void;
  /** Hides the characters, as a password field does. */
  mask?: boolean;
  /** Canonical structural variant. */
  variant?: 'numeric' | 'alphanumeric';
  /**
   * @deprecated Use `variant` instead. Retained as alias for one minor.
   */
  type?: 'numeric' | 'alphanumeric';
  /** Focuses the first cell once mounted. */
  autoFocus?: boolean;
  /** Shown between two cells, hidden from assistive technology. */
  separator?: React.ReactNode;
  /** Cell size. */
  size?: 'sm' | 'md' | 'lg';
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name — a hidden input submits the code. */
  name?: string;
  /** Disables every cell. */
  disabled?: boolean;
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
      variant,
      type,
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
    const c = otpInputClasses(surface, size);
    const resolvedVariant: OtpInputVariant = variant ?? type ?? 'numeric';

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
      const isFull = isOtpComplete(val, length);
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

    const chars = useMemo(() => otpCells(val, length), [val, length]);

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
        // Takes just the last entered char (handles fast typing where the
        // previous value is still present when the new key lands); a rejected
        // char empties the cell. onComplete fires from the effect once `val`
        // is committed.
        const edit = typeOtpCell(chars, index, raw, resolvedVariant);
        setVal(edit.value);
        if (edit.focus !== undefined) focusCell(edit.focus);
      },
      [chars, resolvedVariant, setVal, focusCell],
    );

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const edit = otpKeydown(chars, index, e.key);
        if (!edit) return;
        e.preventDefault();
        if (edit.value !== undefined) setVal(edit.value);
        if (edit.focus !== undefined) focusCell(edit.focus);
      },
      [chars, setVal, focusCell],
    );

    const handlePaste = useCallback(
      (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const edit = pasteOtp(chars, index, e.clipboardData?.getData?.('text') ?? '', resolvedVariant);
        if (!edit) return;
        setVal(edit.value);
        // Defer focus until React has flushed the value into the cells.
        requestAnimationFrame(() => focusCell(edit.focus));
      },
      [chars, setVal, resolvedVariant, focusCell],
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

    const inputMode = otpInputMode(resolvedVariant);
    const pattern = otpPattern(resolvedVariant);

    return (
      <div
        role="group"
        aria-label={otpGroupLabel}
        className={c.root}
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
                aria-label={otpCellLabel(i, length)}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={(e) => handlePaste(i, e)}
                onFocus={handleFocus}
                className={c.cell}
              />
              {separator && !isLast ? (
                <span
                  aria-hidden
                  className={c.separator}
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
