/* ─────────────────────────────────────────────────────────────────────────
   PixelSlider — single OR range slider, with marks, tooltips, and ticks.
   - Single mode (default): value is a number, one thumb.
   - Range mode: value is [number, number], two thumbs, fill between.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  Tone, Surface, cn,
  toneMap, focusRing, surfaceClasses, useEffectiveSurface,
} from '../common';

export type PixelSliderTooltip = 'always' | 'drag' | 'never';

/** A labeled mark on the track. */
export interface PixelSliderMark {
  /** Value at which to position the mark on the track. */
  value: number;
  /** Rendered label content. */
  label: React.ReactNode;
}

/** Shared base props for {@link PixelSlider}. */
interface PixelSliderBaseProps {
  /** Visible label rendered above the track. */
  label: string;
  /** Minimum value. Default: `0`. */
  min?: number;
  /** Maximum value. Default: `100`. */
  max?: number;
  /** Step granularity. Default: `1`. */
  step?: number;
  /** Disables interaction + grays out the track. */
  disabled?: boolean;
  /** Visual tone for the active fill + thumb. Default: `'cyan'`. */
  tone?: Tone;
  /** Render `min` / `max` numbers under the track. */
  showMinMax?: boolean;
  /** Surface variant. Inherits from `PxlKitSurfaceProvider` when omitted. */
  surface?: Surface;
  /** Form-serialization name (range mode emits `name[0]` / `name[1]`). */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** DOM `id` forwarded to the single / lower thumb. */
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
  /** Controlled scalar value. */
  value: number;
  /** Fires with the next scalar value. */
  onChange: (next: number) => void;
}

/** Range (two-thumb) variant. */
export interface PixelSliderRangeProps extends PixelSliderBaseProps {
  /** Controlled `[lo, hi]` tuple. */
  value: [number, number];
  /** Fires with the next `[lo, hi]` tuple. */
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
