/**
 * PixelTypewriter — the classes, the caret, and the typing itself: after a
 * delay, one more character at a steady pace.
 */
import { cn, toneMap, type Tone } from '../../common';

/** The caret shown while the text is being typed. */
export const TYPEWRITER_CARET = '▌';

/**
 * A typewriter's tone: a kit tone, which sets the text in monospace in that
 * colour, or `'inherit'`, which keeps the font and colour of the text around
 * it (a headline that types itself out).
 */
export type TypewriterTone = Tone | 'inherit';

export interface TypewriterClasses {
  /** The wrapper: monospace, in the tone colour — none for `'inherit'`. */
  root: string;
  /**
   * The blinking caret — still for a reader who prefers reduced motion,
   * before the page hydrates too (the component then drops it).
   */
  caret: string;
}

export function typewriterClasses(tone: TypewriterTone): TypewriterClasses {
  return { root: tone === 'inherit' ? '' : cn('font-mono', toneMap[tone].text), caret: 'motion-safe:animate-pulse' };
}

/**
 * Types `text` out: after `delay` ms, one more character every `speed` ms,
 * each slice passed to `onType`; `onDone` follows the last one. Returns the
 * function that stops it.
 */
export function typeText(
  text: string,
  { speed, delay }: { speed: number; delay: number },
  onType: (typed: string) => void,
  onDone: () => void,
): () => void {
  let typed = 0;
  let interval: ReturnType<typeof setInterval> | undefined;
  const timeout = setTimeout(() => {
    interval = setInterval(() => {
      typed++;
      onType(text.slice(0, typed));
      if (typed >= text.length) {
        clearInterval(interval);
        onDone();
      }
    }, speed);
  }, delay);
  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}
