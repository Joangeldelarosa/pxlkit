/**
 * PixelNumberInput — the spinbutton field, its steppers and the logic behind
 * them: parsing what the user types, formatting the value back, clamping and
 * stepping.
 */
import { cn, focusRing, inputBase, sizeHeight, surfaceClasses, toneMap, type Size, type Surface, type Tone } from '../../common';
import { fieldBorderClass } from './input';

/** When a number outside `[min, max]` is pulled back: while typing, on blur, or never. */
export type NumberInputClampBehavior = 'strict' | 'blur' | 'none';

/** `value` limited to `[min, max]`; either bound may be left out. */
export function clampNumber(value: number, min?: number, max?: number): number {
  let next = value;
  if (typeof min === 'number' && next < min) next = min;
  if (typeof max === 'number' && next > max) next = max;
  return next;
}

/** `value` rounded to `precision` decimals, so `0.1 + 0.2` reads `0.3`. */
export function roundToPrecision(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/**
 * The text a value displays as: `precision` fixed decimals when set, the
 * integer digits grouped by `thousandsSeparator` when set; empty without a
 * value.
 */
export function formatNumberInput(
  value: number | undefined,
  precision: number | undefined,
  thousandsSeparator: string | undefined,
): string {
  if (value === undefined || Number.isNaN(value)) return '';
  let text = typeof precision === 'number' ? value.toFixed(precision) : String(value);
  if (thousandsSeparator) {
    const [intPart, decPart] = text.split('.');
    const grouped = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    text = decPart !== undefined ? `${grouped}.${decPart}` : grouped;
  }
  return text;
}

export interface ParsedNumberInput {
  /** What the field shows: the cleaned text, or the raw text while it is no number yet. */
  text: string;
  /** The number typed, or `undefined` for partial input (`''`, `-`, `.`, `-.`) and anything else unreadable. */
  num: number | undefined;
}

/**
 * Reads what the user typed: thousands separators are dropped, minus signs
 * too unless `allowNegative`, and any character that is not a digit, `.` or
 * `-`.
 */
export function parseNumberInput(
  raw: string,
  thousandsSeparator: string | undefined,
  allowNegative: boolean,
): ParsedNumberInput {
  let text = raw;
  if (thousandsSeparator) {
    const separator = thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(separator, 'g'), '');
  }
  if (!allowNegative) text = text.replace(/-/g, '');
  text = text.replace(/[^0-9.-]/g, '');
  if (text === '' || text === '-' || text === '.' || text === '-.') return { text: raw, num: undefined };
  const num = Number(text);
  if (Number.isNaN(num)) return { text: raw, num: undefined };
  return { text, num };
}

export interface NumberInputLimits {
  min?: number;
  max?: number;
  precision?: number;
}

/**
 * The value one `step` up (`1`) or down (`-1`) from `current` — from `min`,
 * or 0, when there is no value yet — clamped and rounded to the precision.
 */
export function stepNumberInput(
  current: number | undefined,
  direction: 1 | -1,
  step: number,
  { min, max, precision }: NumberInputLimits,
): number {
  const base = typeof current === 'number' ? current : (min ?? 0);
  const next = clampNumber(base + direction * step, min, max);
  return typeof precision === 'number' ? roundToPrecision(next, precision) : next;
}

/**
 * The value a field settles on when it loses focus: clamped unless
 * `clampBehavior` is `none`, and rounded to the precision (a non-finite value
 * rounds to 0).
 */
export function settleNumberInput(
  value: number,
  clampBehavior: NumberInputClampBehavior,
  { min, max, precision }: NumberInputLimits,
): number {
  const next = clampBehavior !== 'none' ? clampNumber(value, min, max) : value;
  return typeof precision === 'number' ? roundToPrecision(Number.isFinite(next) ? next : 0, precision) : next;
}

/** Whether a stepper can move no further: the value sits at the bound it steps towards. */
export function numberInputAtLimit(
  current: number | undefined,
  direction: 1 | -1,
  { min, max }: NumberInputLimits,
): boolean {
  if (typeof current !== 'number') return false;
  return direction === 1 ? typeof max === 'number' && current >= max : typeof min === 'number' && current <= min;
}

export interface NumberInputClassOptions {
  tone: Tone;
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
  /** A prefix sits inside the field on the left. */
  prefix: boolean;
  /** A suffix sits inside the field on the right. */
  suffix: boolean;
  /** The steppers are hidden. */
  hideControls: boolean;
}

export interface NumberInputClasses {
  /** Positions the prefix, suffix and steppers over the input. */
  shell: string;
  input: string;
  prefix: string;
  suffix: string;
  /** The column of the two steppers. */
  controls: string;
  stepper: string;
}

/** Classes of every part of a PixelNumberInput. */
export function numberInputClasses(surface: Surface, options: NumberInputClassOptions): NumberInputClasses {
  const s = surfaceClasses(surface);
  return {
    shell: 'relative block',
    input: cn(
      inputBase,
      s.font,
      s.border,
      s.radius,
      s.transition,
      sizeHeight[options.size],
      focusRing,
      toneMap[options.tone].ring,
      fieldBorderClass(options.invalid),
      options.prefix ? 'pl-8' : 'pl-3',
      // The steppers take the right side; without them only a suffix needs room.
      options.hideControls ? (options.suffix ? 'pr-10' : 'pr-3') : 'pr-16',
    ),
    prefix: cn(
      'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0',
      s.font,
    ),
    suffix: cn(
      'pointer-events-none absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0',
      s.font,
      options.hideControls ? 'right-3' : 'right-16',
    ),
    controls: 'absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5',
    stepper: cn(
      'border border-retro-border-strong bg-retro-surface/60 px-1.5 text-[10px] leading-none text-retro-muted hover:text-retro-text disabled:opacity-40 disabled:cursor-not-allowed',
      s.font,
      s.radius,
      'h-3.5 flex items-center justify-center',
    ),
  };
}
