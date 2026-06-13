/* ─────────────────────────────────────────────────────────────────────────
   PixelTextarea — multi-line text input.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import {
  Tone, Surface, cn,
  toneMap, focusRing, inputBase, surfaceClasses, useEffectiveSurface,
  FieldShell,
} from '../common';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { getStringLength } from './_internal/getStringLength';

/** Public prop bag for {@link PixelTextarea}. */
export interface PixelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Floating label rendered above the textarea. */
  label?: string;
  /** Helper text shown below the field. Hidden when `error` is set. */
  hint?: string;
  /** Error message shown below the field; flips visual state to invalid. */
  error?: string;
  /** Visual tone for focus ring + border emphasis. Default: `'neutral'`. */
  tone?: Tone;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
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
  const reactId = useId();
  const textareaId = rest.id ?? `pxl-textarea-${reactId}`;

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
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={textareaId}>
      <textarea
        id={textareaId}
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
