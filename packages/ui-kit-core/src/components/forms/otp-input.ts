/**
 * PixelOTPInput — one cell per character of a one-time passcode: what a cell
 * accepts, how typing, Backspace, the arrows and a paste change the code and
 * move focus, and the classes of the cells.
 */
import { cn, focusRing, inputBase, sizeHeight, surfaceClasses, toneMap, type Size, type Surface } from '../../common';

/** The characters a passcode accepts: digits, or digits and letters. */
export type OtpInputVariant = 'numeric' | 'alphanumeric';

/** `raw` without the characters `variant` does not accept. */
export function sanitizeOtp(raw: string, variant: OtpInputVariant): string {
  if (variant === 'numeric') return raw.replace(/[^0-9]/g, '');
  return raw.replace(/[^0-9a-zA-Z]/g, '');
}

/** The character of each cell: the code's characters in order, then empty cells. */
export function otpCells(value: string, length: number): string[] {
  const cells = new Array<string>(length).fill('');
  for (let i = 0; i < Math.min(value.length, length); i++) cells[i] = value[i];
  return cells;
}

/**
 * The code once cell `index` holds `char` (`''` empties it). The cells join
 * into one string, so an emptied cell closes up: the characters after it
 * move back one cell.
 */
export function setOtpCell(cells: readonly string[], index: number, char: string): string {
  const next = cells.slice();
  next[index] = char;
  return next.join('');
}

/** A change to the code and the cell that takes focus, each when there is one. */
export interface OtpEdit {
  value?: string;
  focus?: number;
}

/**
 * What typing `raw` into cell `index` does: the last accepted character
 * fills the cell and focus moves on to the next one; with nothing accepted
 * the cell empties.
 */
export function typeOtpCell(
  cells: readonly string[],
  index: number,
  raw: string,
  variant: OtpInputVariant,
): OtpEdit & { value: string } {
  const accepted = sanitizeOtp(raw, variant);
  if (!accepted) return { value: setOtpCell(cells, index, '') };
  const value = setOtpCell(cells, index, accepted.slice(-1));
  return index < cells.length - 1 ? { value, focus: index + 1 } : { value };
}

/**
 * What a key does in cell `index`: Backspace empties the cell, or from an
 * empty cell goes back and empties the previous one; the arrows move a cell
 * left or right, Home and End to the first and last. `undefined` when the
 * key does nothing there.
 */
export function otpKeydown(cells: readonly string[], index: number, key: string): OtpEdit | undefined {
  if (key === 'Backspace') {
    if (cells[index]) return { value: setOtpCell(cells, index, '') };
    if (index > 0) return { value: setOtpCell(cells, index - 1, ''), focus: index - 1 };
    return undefined;
  }
  if (key === 'ArrowLeft' && index > 0) return { focus: index - 1 };
  if (key === 'ArrowRight' && index < cells.length - 1) return { focus: index + 1 };
  if (key === 'Home') return { focus: 0 };
  if (key === 'End') return { focus: cells.length - 1 };
  return undefined;
}

/**
 * What pasting `text` into cell `index` does: its accepted characters fill
 * the cells from there on, and focus moves to the cell after the last one
 * filled (the last cell at most). `undefined` when nothing is accepted.
 */
export function pasteOtp(cells: readonly string[], index: number, text: string, variant: OtpInputVariant): Required<OtpEdit> | undefined {
  const accepted = sanitizeOtp(text, variant);
  if (!accepted) return undefined;
  const next = cells.slice();
  let cursor = index;
  for (const char of accepted) {
    if (cursor >= next.length) break;
    next[cursor] = char;
    cursor++;
  }
  return { value: next.join(''), focus: Math.min(cursor, next.length - 1) };
}

/** Whether the code fills every cell. */
export function isOtpComplete(value: string, length: number): boolean {
  return length > 0 && value.length === length;
}

/** `inputmode` of the cells: the numeric keypad for digits. */
export function otpInputMode(variant: OtpInputVariant): 'numeric' | 'text' {
  return variant === 'numeric' ? 'numeric' : 'text';
}

/** `pattern` of the cells. */
export function otpPattern(variant: OtpInputVariant): string {
  return variant === 'numeric' ? '[0-9]*' : '[0-9a-zA-Z]*';
}

/** Accessible name of cell `index`. */
export function otpCellLabel(index: number, length: number): string {
  return `Digit ${index + 1} of ${length}`;
}

/** Accessible name of the group of cells. */
export const otpGroupLabel = 'One-time passcode';

/** Square size and type size of a cell. */
const otpCellSizeClasses: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

// A text field's look but its full width: `w-full` would beat the cell's
// width, as nothing merges the two and Tailwind emits `w-full` last.
const cellBase = inputBase
  .split(' ')
  .filter((name) => name !== 'w-full')
  .join(' ');

/** The type size of the control scale: the classes of `sizeHeight` but its height. */
function controlTextClasses(size: Size): string {
  return sizeHeight[size]
    .split(' ')
    .filter((name) => !name.startsWith('h-'))
    .join(' ');
}

export interface OtpInputClasses {
  /** The row of cells. */
  root: string;
  cell: string;
  /** What sits between two cells. */
  separator: string;
}

/** Classes of the cells of a PixelOTPInput and the row holding them. */
export function otpInputClasses(surface: Surface, size: Size): OtpInputClasses {
  const s = surfaceClasses(surface);
  return {
    root: cn('inline-flex max-w-full flex-wrap items-center', s.font),
    cell: cn(
      cellBase,
      s.font,
      s.border,
      s.radius,
      s.transition,
      otpCellSizeClasses[size],
      controlTextClasses(size),
      focusRing,
      toneMap.neutral.ring,
      'text-center px-0 border-retro-border-strong',
      'mx-0.5 first:ml-0 last:mr-0',
    ),
    separator: 'mx-1 inline-flex items-center text-retro-muted select-none',
  };
}
