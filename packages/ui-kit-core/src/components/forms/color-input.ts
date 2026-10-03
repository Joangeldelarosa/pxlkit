/**
 * PixelColorInput — a trigger that shows a colour and opens a popover with
 * the browser's colour picker, a hex field and a grid of presets. The colour
 * parsing and conversions, the value a pick writes in each format, the
 * presets grid's keys, and the class recipes.
 */
import { cn, focusRing, inputBase, sizeHeight, surfaceClasses, type Size, type Surface } from '../../common';
import { fieldBorderClass } from './input';

/** How a picked colour is written: `#rrggbb`, `rgb(r, g, b)` or `hsl(h, s%, l%)`. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/** The presets offered when none are given: greys, then a hue wheel. */
export const DEFAULT_COLOR_PRESETS: readonly string[] = [
  '#000000', '#1a1a1a', '#404040', '#737373',
  '#a3a3a3', '#d4d4d4', '#f5f5f5', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
];

/** Columns of the presets grid, which the arrow keys move along. */
export const COLOR_PRESET_COLUMNS = 8;

/** A colour channel as a byte, 0 for a value that is not a number. */
function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * `#rrggbb` in lower case for a hex colour typed with or without its `#`,
 * in six digits or three (`#abc` is `#aabbcc`); `null` for anything else.
 */
export function normalizeHex(input: string): string | null {
  if (!input) return null;
  let hex = input.trim().toLowerCase();
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    hex = `#${hex
      .slice(1)
      .split('')
      .map((digit) => digit + digit)
      .join('')}`;
  }
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
}

/** The channels of a hex colour, or `null` when it is not one. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

/** Hue in degrees, saturation and lightness in percent, each rounded. */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === red) h = (green - blue) / d + (green < blue ? 6 : 0);
    else if (max === green) h = (blue - red) / d + 2;
    else h = (red - green) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** A hex colour written in `format`; anything that is not a hex colour, unchanged. */
export function formatColor(hex: string, format: ColorFormat): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  if (format === 'hex') return normalizeHex(hex)!;
  if (format === 'rgb') return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * The value a pick or a typed colour writes: a hex colour in `format`;
 * anything else as it is.
 */
export function colorInputValue(input: string, format: ColorFormat): string {
  return normalizeHex(input) ? formatColor(input, format) : input;
}

/**
 * `#rrggbb` of a value, for the swatch and the browser's picker: a hex
 * colour, or the channels of an `rgb()` one; white while there is no value,
 * black for anything else.
 */
export function colorSwatchHex(value: string): string {
  if (!value) return '#ffffff';
  const hex = normalizeHex(value);
  if (hex) return hex;
  const rgb = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(value);
  if (!rgb) return '#000000';
  return `#${[rgb[1], rgb[2], rgb[3]].map((channel) => clampByte(Number(channel)).toString(16).padStart(2, '0')).join('')}`;
}

/** Whether a preset is the colour the swatch shows (see `colorSwatchHex`). */
export function isColorPresetSelected(preset: string, swatchHex: string): boolean {
  return swatchHex.toLowerCase() === (normalizeHex(preset) ?? preset).toLowerCase();
}

/** What a key pressed on a preset does: focus another preset, or pick this one. */
export type ColorPresetKeyAction = { focus: number } | { select: true };

/**
 * What a key pressed on the preset at `index` of `count` does: the arrows
 * move focus along the grid's rows and columns and Home / End to the first
 * and last preset, stopping at the ends; Enter and Space pick the preset.
 * `null` for a key the grid leaves alone.
 */
export function colorPresetKeydown(key: string, index: number, count: number): ColorPresetKeyAction | null {
  const to = (next: number) => ({ focus: Math.max(0, Math.min(count - 1, next)) });
  switch (key) {
    case 'ArrowRight':
      return to(index + 1);
    case 'ArrowLeft':
      return to(index - 1);
    case 'ArrowDown':
      return to(index + COLOR_PRESET_COLUMNS);
    case 'ArrowUp':
      return to(index - COLOR_PRESET_COLUMNS);
    case 'Home':
      return to(0);
    case 'End':
      return to(count - 1);
    case 'Enter':
    case ' ':
      return { select: true };
    default:
      return null;
  }
}

export interface ColorInputClassOptions {
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
  /** A colour is set; otherwise the trigger shows its placeholder. */
  hasValue: boolean;
}

export interface ColorInputClasses {
  /** Anchors the popover to the trigger. */
  anchor: string;
  trigger: string;
  /** The trigger's colour sample. */
  sample: string;
  /** The trigger's text: the value, or its placeholder. */
  value: string;
  content: string;
  /** The row of the browser's picker and the hex field. */
  pickers: string;
  /** The browser's colour picker. */
  native: string;
  /** The hex field's visually hidden label. */
  hexLabel: string;
  hex: string;
  presets: string;
}

/** Classes of every part of a colour input but its presets. */
export function colorInputClasses(surface: Surface, { size, invalid, hasValue }: ColorInputClassOptions): ColorInputClasses {
  const s = surfaceClasses(surface);
  return {
    anchor: 'relative block',
    trigger: cn(
      inputBase,
      s.font,
      s.border,
      s.radius,
      s.transition,
      sizeHeight[size],
      focusRing,
      'flex items-center gap-2 px-2 text-left',
      fieldBorderClass(invalid),
    ),
    sample: cn(
      'inline-block h-5 w-5 shrink-0 border border-retro-border-strong',
      surface === 'pixel' ? 'rounded-[2px]' : 'rounded',
    ),
    value: cn('min-w-0 flex-1 truncate', hasValue ? 'text-retro-text' : 'text-retro-muted'),
    content: 'w-64 p-2',
    pickers: 'mb-2 flex items-center gap-2',
    native: cn('h-8 w-10 cursor-pointer bg-transparent p-0', s.border, s.radius, 'border-retro-border-strong'),
    hexLabel: cn('sr-only', s.font),
    hex: cn(inputBase, s.font, s.border, s.radius, 'h-8 flex-1 px-2 text-xs', focusRing, fieldBorderClass(invalid)),
    presets: 'grid grid-cols-8 gap-1',
  };
}

/** A preset swatch, ringed while it is the colour set. */
export function colorPresetClasses(surface: Surface, selected: boolean): string {
  return cn(
    'h-6 w-6 border border-retro-border-strong',
    surface === 'pixel' ? 'rounded-[2px]' : 'rounded',
    focusRing,
    selected && 'ring-2 ring-retro-cyan ring-offset-1 ring-offset-retro-bg',
  );
}
