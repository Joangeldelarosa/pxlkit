/** PixelTextarea — the multi-line field and its auto-grow behaviour. */
import { cn, fieldBase, focusRing, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';
import { fieldBorderClass } from './input';

export interface TextareaClassOptions {
  tone: Tone;
  /** The field shows an error. */
  invalid: boolean;
  /** The textarea grows with its content instead of being resized by hand. */
  autosize: boolean;
}

/** The `<textarea>` of a PixelTextarea. */
export function textareaClasses(surface: Surface, options: TextareaClassOptions): string {
  const s = surfaceClasses(surface);
  return cn(
    fieldBase,
    s.font,
    s.border,
    s.radius,
    s.transition,
    focusRing,
    toneMap[options.tone].ring,
    options.autosize ? 'px-3 py-2 text-sm resize-none' : 'min-h-24 px-3 py-2 text-sm',
    fieldBorderClass(options.invalid),
  );
}

/**
 * Fits a textarea's height to its content, between `minRows` and `maxRows`
 * lines (no cap when `maxRows` is left out); past the cap it scrolls. Lines
 * are measured from the computed line height, 20px when it cannot be read.
 */
export function autosizeTextarea(element: HTMLTextAreaElement, minRows: number, maxRows: number | undefined): void {
  const style = window.getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight) || 20;
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const min = lineHeight * minRows + padY;
  const max = typeof maxRows === 'number' ? lineHeight * maxRows + padY : Infinity;
  // Reset first so the textarea can shrink, then read its content height.
  element.style.height = 'auto';
  element.style.height = `${Math.max(min, Math.min(element.scrollHeight, max))}px`;
  element.style.overflowY = element.scrollHeight > max ? 'auto' : 'hidden';
}
