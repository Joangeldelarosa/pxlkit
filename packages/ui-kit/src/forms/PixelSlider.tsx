/* ─────────────────────────────────────────────────────────────────────────
   PixelSlider — single OR range slider, with marks, tooltips, and ticks.
   - Single mode (default): value is a number, one thumb.
   - Range mode: value is [number, number], two thumbs, fill between.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  isSliderRange,
  moveSliderThumb,
  nearestSliderThumb,
  sliderClasses,
  sliderFill,
  sliderKeyValue,
  sliderPercent,
  sliderThumbLabel,
  sliderThumbLeft,
  sliderThumbValues,
  sliderTicks,
  sliderTooltipVisible,
  sliderValueAt,
  sliderValueText,
  type SliderThumb,
  type SliderTooltipMode,
} from '@pxlkit/ui-kit-core';
import {
  Tone, Surface,
  useEffectiveSurface,
} from '../common';

export type PixelSliderTooltip = SliderTooltipMode;

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
  const c = sliderClasses(surface, { tone, disabled });
  const trackRef = useRef<HTMLDivElement>(null);

  const range = isSliderRange(value);
  const [v0, v1] = sliderThumbValues(value);

  // Which thumb is being dragged (0 = single/lower, 1 = upper). null = idle.
  const draggingIdx = useRef<SliderThumb | null>(null);
  const [activeIdx, setActiveIdx] = useState<SliderThumb | null>(null);

  // In a range the moved thumb stops at the other one: lower stays ≤ upper.
  const emit = useCallback(
    (idx: SliderThumb, next: number) =>
      (onChange as (n: number | [number, number]) => void)(moveSliderThumb(value, idx, next, { min, max, step })),
    [onChange, value, min, max, step],
  );

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      return sliderValueAt(clientX, track.getBoundingClientRect(), min, max);
    },
    [min, max],
  );

  const pickNearestIdx = useCallback(
    (clientX: number): SliderThumb => (range ? nearestSliderThumb(value, valueFromClientX(clientX)) : 0),
    [range, value, valueFromClientX],
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

  const makeKeyDown = (idx: SliderThumb) =>
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const next = sliderKeyValue(e.key, idx === 0 ? v0 : v1, { min, max, step });
      if (next === undefined) return;
      e.preventDefault();
      emit(idx, next);
    };

  const pctOf = (n: number) => sliderPercent(n, min, max);
  const p0 = pctOf(v0);
  const p1 = pctOf(v1);
  const fill = sliderFill(value, min, max);

  const renderThumb = (idx: SliderThumb, pct: number, val: number) => (
    <React.Fragment key={idx}>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        aria-label={sliderThumbLabel(label, range, idx)}
        aria-disabled={disabled}
        aria-required={range ? undefined : required || undefined}
        id={idx === 0 ? id : undefined}
        onKeyDown={makeKeyDown(idx)}
        onFocus={() => setActiveIdx(idx)}
        onBlur={() => setActiveIdx((cur) => (cur === idx ? null : cur))}
        className={c.thumb}
        style={{ left: sliderThumbLeft(pct) }}
      >
        {sliderTooltipVisible(showTooltip, activeIdx, idx) && (
          <span
            role="tooltip"
            className={c.tooltip}
          >
            {val}
          </span>
        )}
      </div>
    </React.Fragment>
  );

  // Tick positions — every step inside [min,max]. Cap at 50 to avoid
  // pathological DOM bloat when step is too small.
  const tickValues = useMemo(
    () => (ticks ? sliderTicks({ min, max, step }) : []),
    [ticks, min, max, step],
  );

  const trackBody = (
    <div
      ref={trackRef}
      role={range ? 'group' : undefined}
      aria-label={range ? label : undefined}
      className={c.track}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={c.fill}
        style={{ left: `${fill.left}%`, width: `${fill.width}%`, opacity: 0.8 }}
      />
      {renderThumb(0, p0, v0)}
      {range && renderThumb(1, p1, v1)}
    </div>
  );

  return (
    <div ref={ref} className={c.root}>
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
      <div className={c.header}>
        <span>{label}</span>
        <span className={c.value}>{sliderValueText(value)}</span>
      </div>
      {trackBody}
      {ticks && tickValues.length > 0 && (
        <div className={c.ticks} aria-hidden>
          {tickValues.map((tv, i) => (
            <span
              key={i}
              data-testid="pxl-slider-tick"
              className={c.tick}
              style={{ left: `${pctOf(tv)}%` }}
            />
          ))}
        </div>
      )}
      {marks && marks.length > 0 && (
        <div className={c.marks} data-testid="pxl-slider-marks">
          {marks.map((m, i) => (
            <span
              key={i}
              className={c.mark}
              style={{ left: `${pctOf(m.value)}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
      {showMinMax && (
        <div className={c.bounds}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
});
