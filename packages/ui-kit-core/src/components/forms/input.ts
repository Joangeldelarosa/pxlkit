/**
 * PixelInput — the text field, the content inside its shell (prefix, suffix,
 * clear button, loading spinner) and the addons joined to its edges.
 */
import {
  cn,
  focusRing,
  inputBase,
  sizeHeight,
  surfaceClasses,
  toneMap,
  type Size,
  type Surface,
  type Tone,
} from '../../common';

/** Border of a text control: red while it shows an error. */
export function fieldBorderClass(invalid: boolean): string {
  return invalid ? 'border-retro-red/60' : 'border-retro-border-strong';
}

export interface InputControlOptions {
  tone: Tone;
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
  /** Content sits inside the shell on the left (`prefix`, or the legacy `icon`). */
  leading: boolean;
  /** Content sits inside the shell on the right (`suffix`, or the loading spinner). */
  trailing: boolean;
  /** The clear button shows, next to any trailing content. */
  clearButton: boolean;
  /** An addon is joined to the left edge. */
  addonLeft: boolean;
  /** An addon is joined to the right edge. */
  addonRight: boolean;
}

/** The `<input>` of a PixelInput, padded for whatever surrounds it. */
export function inputControlClasses(surface: Surface, options: InputControlOptions): string {
  const s = surfaceClasses(surface);
  // Each side reserves room for what sits inside the shell there; the clear
  // button and trailing content share the right side.
  const rightSlots = (options.trailing ? 1 : 0) + (options.clearButton ? 1 : 0);
  return cn(
    inputBase,
    s.font,
    s.border,
    s.radius,
    s.transition,
    sizeHeight[options.size],
    focusRing,
    toneMap[options.tone].ring,
    fieldBorderClass(options.invalid),
    options.leading ? 'pl-10' : 'pl-3',
    rightSlots === 0 ? 'pr-3' : rightSlots === 1 ? 'pr-10' : 'pr-16',
    // Joined edges lose their corners, so the group reads as one control.
    options.addonLeft && 'rounded-l-none',
    options.addonRight && 'rounded-r-none',
  );
}

export interface InputClasses {
  /** Positions the inside content around the input. */
  shell: string;
  /** Content inside the shell on the left. */
  leading: string;
  /** The right-hand cluster: clear button, then trailing content. */
  trailing: string;
  clearButton: string;
  clearIcon: string;
  /** Trailing content (suffix or spinner). */
  suffix: string;
  /** Spinner that replaces the suffix while loading. */
  spinner: string;
  /** Row joining the addons to the shell. */
  addons: string;
  addonLeft: string;
  addonRight: string;
}

/** Classes of the parts around a PixelInput's `<input>`. */
export function inputClasses(surface: Surface, size: Size): InputClasses {
  const s = surfaceClasses(surface);
  const addon = cn(
    'inline-flex items-center bg-retro-surface/60 px-3 text-retro-muted shrink-0',
    s.font,
    s.border,
    s.radius,
    sizeHeight[size],
  );
  return {
    shell: 'relative block w-full min-w-0',
    leading:
      'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-retro-muted shrink-0',
    trailing: 'absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-retro-muted',
    clearButton: 'inline-flex items-center justify-center text-retro-muted hover:text-retro-text',
    clearIcon: 'h-3 w-3',
    suffix: cn('pointer-events-none inline-flex items-center justify-center shrink-0', s.font),
    spinner: 'inline-block h-3 w-3 animate-spin border-2 border-retro-muted border-t-transparent rounded-full',
    addons: 'flex w-full items-stretch',
    addonLeft: cn(addon, 'border-retro-border-strong rounded-r-none border-r-0'),
    addonRight: cn(addon, 'border-retro-border-strong rounded-l-none border-l-0'),
  };
}
