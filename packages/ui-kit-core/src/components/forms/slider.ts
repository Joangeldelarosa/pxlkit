/**
 * PixelSlider — one thumb on a track, or two bounding a range: the value
 * math behind dragging and the keyboard (snapping, clamping, the thumbs'
 * order), the positions on the track and the classes of every part.
 */
import { cn, focusRing, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

/** When a thumb shows its value above it: always, while dragged or focused, or never. */
export type SliderTooltipMode = 'always' | 'drag' | 'never';

/** A slider's value: a number, or the `[low, high]` bounds of a range. */
export type SliderValue = number | [number, number];

/** Which thumb: the only (or lower) one, or the upper one of a range. */
export type SliderThumb = 0 | 1;

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
}

/** Whether a value is a range (`[low, high]`). */
export function isSliderRange(value: SliderValue): value is [number, number] {
  return Array.isArray(value);
}

/** The thumbs' values: the same number twice for a single slider. */
export function sliderThumbValues(value: SliderValue): [number, number] {
  return isSliderRange(value) ? [value[0], value[1]] : [value, value];
}

/** `value` rounded to the nearest multiple of `step`, then kept within `[min, max]`. */
export function snapSliderValue(value: number, { min, max, step }: SliderBounds): number {
  return Math.max(min, Math.min(max, Math.round(value / step) * step));
}

/**
 * The slider's value once `thumb` moves to `next` (snapped and clamped). In a
 * range the moved thumb stops at the other one, so the bounds never cross.
 */
export function moveSliderThumb(value: SliderValue, thumb: SliderThumb, next: number, bounds: SliderBounds): SliderValue {
  const snapped = snapSliderValue(next, bounds);
  if (!isSliderRange(value)) return snapped;
  const [low, high] = value;
  return thumb === 0 ? [Math.min(snapped, high), high] : [low, Math.max(snapped, low)];
}

/**
 * Where a key sends a thumb from `current`: a step up (ArrowRight, ArrowUp)
 * or down (ArrowLeft, ArrowDown), ten steps (PageUp, PageDown), or an end
 * (Home, End) — never past the bounds. `undefined` for any other key.
 */
export function sliderKeyValue(key: string, current: number, { min, max, step }: SliderBounds): number | undefined {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return Math.min(max, current + step);
    case 'ArrowLeft':
    case 'ArrowDown':
      return Math.max(min, current - step);
    case 'Home':
      return min;
    case 'End':
      return max;
    case 'PageUp':
      return Math.min(max, current + step * 10);
    case 'PageDown':
      return Math.max(min, current - step * 10);
    default:
      return undefined;
  }
}

/** Where `value` sits on the track, in percent of its length (0–100). */
export function sliderPercent(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/** The value under a pointer at `clientX`, over a track spanning `left` to `left + width`. */
export function sliderValueAt(clientX: number, { left, width }: { left: number; width: number }, min: number, max: number): number {
  const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
  return min + ratio * (max - min);
}

/** The thumb a press at `value` grabs: the nearer one, the lower on a tie. */
export function nearestSliderThumb(value: SliderValue, at: number): SliderThumb {
  if (!isSliderRange(value)) return 0;
  return Math.abs(at - value[0]) <= Math.abs(at - value[1]) ? 0 : 1;
}

/** The filled part of the track, in percent: from the start to the thumb, or between a range's thumbs. */
export function sliderFill(value: SliderValue, min: number, max: number): { left: number; width: number } {
  const [low, high] = sliderThumbValues(value);
  const p0 = sliderPercent(low, min, max);
  const p1 = sliderPercent(high, min, max);
  if (!isSliderRange(value)) return { left: 0, width: p0 };
  const left = Math.min(p0, p1);
  return { left, width: Math.max(p0, p1) - left };
}

/**
 * Values of the tick marks: one per step from `min` to `max`, at most 51 —
 * a step too small for its range gets 50 even intervals instead.
 */
export function sliderTicks({ min, max, step }: SliderBounds): number[] {
  const count = Math.floor((max - min) / step);
  if (count <= 0) return [];
  const limit = Math.min(count, 50);
  return Array.from({ length: limit + 1 }, (_, i) => min + (i * (max - min)) / limit);
}

/** The value shown next to the label: `40`, or `20 – 80` for a range. */
export function sliderValueText(value: SliderValue): string {
  return isSliderRange(value) ? `${value[0]} – ${value[1]}` : `${value}`;
}

/** Accessible name of a thumb: the label, with `minimum` / `maximum` for a range's thumbs. */
export function sliderThumbLabel(label: string, range: boolean, thumb: SliderThumb): string {
  if (!range) return label;
  return `${label} ${thumb === 0 ? 'minimum' : 'maximum'}`;
}

/** Whether a thumb shows its value, given the thumb being dragged or focused (`active`). */
export function sliderTooltipVisible(mode: SliderTooltipMode, active: SliderThumb | null, thumb: SliderThumb): boolean {
  if (mode === 'always') return true;
  if (mode === 'never') return false;
  return active === thumb;
}

/** `left` of a thumb, centred on its value (the thumb is 16px wide). */
export function sliderThumbLeft(percent: number): string {
  return `calc(${percent}% - 8px)`;
}

export interface SliderClassOptions {
  tone: Tone;
  disabled: boolean;
}

export interface SliderClasses {
  root: string;
  /** The row holding the label and the value. */
  header: string;
  value: string;
  track: string;
  fill: string;
  thumb: string;
  tooltip: string;
  ticks: string;
  tick: string;
  marks: string;
  mark: string;
  /** The row holding the `min` and `max` numbers. */
  bounds: string;
}

/** Classes of every part of a PixelSlider. */
export function sliderClasses(surface: Surface, { tone, disabled }: SliderClassOptions): SliderClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  const rounded = surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full';
  return {
    root: cn('space-y-2', disabled && 'opacity-50'),
    header: cn('flex items-center justify-between text-xs text-retro-muted', s.font),
    value: t.text,
    track: cn(
      'group relative h-2.5 outline-none touch-none border border-retro-border-strong bg-retro-surface/50',
      rounded,
      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    ),
    fill: cn('absolute inset-y-0 transition-[width]', rounded, t.bg),
    thumb: cn(
      'absolute top-1/2 h-4 w-4 -translate-y-1/2 border-2 bg-retro-bg shadow-md transition-shadow outline-none',
      rounded,
      !disabled && 'group-hover:shadow-[0_0_0_3px_rgba(0,0,0,.15)]',
      focusRing,
      t.ring,
      t.border,
    ),
    tooltip: cn(
      'pointer-events-none absolute left-1/2 -top-7 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 text-[10px] text-retro-text bg-retro-bg',
      s.font,
      s.border,
      s.radius,
      'border-retro-border-strong',
    ),
    ticks: 'relative h-2',
    tick: 'absolute top-0 h-1.5 w-px bg-retro-muted/40',
    marks: 'relative h-4',
    mark: cn('absolute top-0 -translate-x-1/2 text-[10px] text-retro-muted', s.font),
    bounds: cn('flex justify-between text-[10px] text-retro-muted/50', s.font),
  };
}
