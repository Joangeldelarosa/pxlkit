/**
 * PixelDatePicker — a trigger that shows the picked day and opens a month's
 * grid in a popover, with quick-pick presets above it and a clear button
 * below. PixelDateRangePicker shares its recipes; the grid's own are
 * PixelCalendarGrid's.
 */
import { cn, focusRing, inputBase, sizeHeight, surfaceClasses, toneMap, type Size, type Surface } from '../../common';
import { fieldBorderClass } from './input';

export interface DatePickerClassOptions {
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
  /** The trigger shows the placeholder. */
  placeholder: boolean;
  /** Months the popover shows side by side: a range picker shows two by default. */
  months?: 1 | 2;
  /** A range picker's clear button lies over the trigger's end, which keeps room for it. */
  clearButton?: boolean;
}

export interface DatePickerClasses {
  /** Anchors the popover to the trigger. */
  anchor: string;
  trigger: string;
  /** The trigger's text. */
  value: string;
  /** The ▾ after it. */
  mark: string;
  /**
   * A range picker's clear button: beside the trigger, as a button cannot
   * hold another, and laid over the trigger's end in place of the mark.
   */
  clearButton: string;
  content: string;
  presets: string;
  preset: string;
  /** A range picker's months, side by side. */
  months: string;
  footer: string;
  clear: string;
}

/** Classes of the parts of a date picker, or of a date range picker. */
export function datePickerClasses(
  surface: Surface,
  { size, invalid, placeholder, months = 1, clearButton = false }: DatePickerClassOptions,
): DatePickerClasses {
  const s = surfaceClasses(surface);
  const button = 'px-2 py-1 text-[11px] uppercase tracking-wide';
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
      toneMap.neutral.ring,
      fieldBorderClass(invalid),
      'inline-flex items-center justify-between text-left',
      // Room for the clear button over its end: the text stops short of it.
      clearButton ? 'pl-3 pr-7' : 'px-3',
      placeholder && 'text-retro-muted',
    ),
    value: 'truncate',
    mark: 'ml-2 text-retro-muted text-xs',
    clearButton: cn(
      'absolute top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center',
      // Its × where the mark would be: 12px in from the trigger's border.
      surface === 'linear' ? 'right-1' : 'right-1.5',
      'text-retro-muted hover:text-retro-text text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40 rounded-[2px]',
      s.font,
    ),
    content: cn(months === 2 ? 'w-[34rem] max-w-[calc(100vw-1rem)]' : 'w-[18rem]', s.font),
    presets: 'mb-2 flex flex-wrap gap-1 pb-2 border-b border-retro-border/60',
    preset: cn(
      button,
      s.border,
      s.radius,
      'border-retro-border-strong bg-retro-surface/40 text-retro-text',
      'hover:bg-retro-surface/70',
      s.transition,
    ),
    months: cn('grid gap-4', months === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'),
    footer: 'mt-2 pt-2 border-t border-retro-border/60 flex justify-end',
    clear: cn(button, s.border, s.radius, 'border-retro-border-strong text-retro-muted hover:text-retro-text', s.transition),
  };
}
