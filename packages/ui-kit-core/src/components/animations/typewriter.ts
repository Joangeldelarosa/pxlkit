/**
 * PixelTypewriter — the classes, the caret, and the typing itself: after a
 * delay, one more character at a steady pace.
 */
import { cn, toneMap, type Tone } from '../../common';

/** The caret shown while the text is being typed. */
export const TYPEWRITER_CARET = '▌';

export interface TypewriterClasses {
  /** The wrapper: monospace, in the tone colour. */
  root: string;
  /** The blinking caret. */
  caret: string;
}

export function typewriterClasses(tone: Tone): TypewriterClasses {
  return { root: cn('font-mono', toneMap[tone].text), caret: 'animate-pulse' };
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
