/**
 * PixelGlitch — a CRT glitch in three layers: the content, sliced and shifted
 * (keyframes `pxl-glitch`), under two colour-split copies of it that flash on
 * other slices (`pxl-glitch-r`, `pxl-glitch-c`). The copies of other content
 * are layers in the document; the copies of a glitch's `label` (its text)
 * are drawn by the stylesheet, so the text is in the document once.
 */
import type { AnimationStyle } from './animation';

/**
 * Element of the wrapper and of its layers. A `span` glitch sits inside
 * phrasing content, such as a heading: put the heading around it, as the
 * layers repeat whatever they hold.
 */
export type GlitchElement = 'div' | 'span';

export const glitchClasses = {
  /** The wrapper the ghost layers are positioned in. */
  root: 'relative inline-block overflow-visible',
  /** A ghost layer: a copy of the content over it, which the pointer goes through. */
  ghost: 'pointer-events-none absolute inset-0',
  /**
   * The wrapper of a text glitch while it plays: the stylesheet draws its
   * two copies on `::before` and `::after` from its `data-text` (see
   * styles.css), with the keyframes, filters and shift of the ghost layers.
   */
  copies: 'pxl-glitch-copies',
};

/** The content's layer: a block as a `span` too, where the keyframes' transforms apply. */
export function glitchMainClasses(element: GlitchElement): string | undefined {
  return element === 'span' ? 'block' : undefined;
}

export interface GlitchAnimation {
  /** Length of one loop in milliseconds. */
  duration: number;
  /** Largest horizontal shift of the layers, in pixels. */
  intensity: number;
}

export interface GlitchStyles {
  /** The reddish ghost layer, shifting left. */
  red: AnimationStyle;
  /** The cyan ghost layer, shifting right on offset slices. */
  cyan: AnimationStyle;
  /** The content itself. */
  main: AnimationStyle;
}

/** The layers' styles while the glitch plays; the keyframes read the shift from `--pxl-glitch-x`. */
export function glitchStyles({ duration, intensity }: GlitchAnimation): GlitchStyles {
  const shift = `${intensity}px`;
  return {
    red: {
      animation: `pxl-glitch-r ${duration}ms steps(1) infinite`,
      '--pxl-glitch-x': shift,
      filter: 'saturate(0) sepia(1) hue-rotate(-20deg) brightness(1.3)',
      overflow: 'hidden',
    },
    cyan: {
      animation: `pxl-glitch-c ${duration}ms steps(1) infinite`,
      '--pxl-glitch-x': shift,
      filter: 'saturate(0) sepia(1) hue-rotate(150deg) brightness(1.1)',
      overflow: 'hidden',
    },
    main: { animation: `pxl-glitch ${duration}ms steps(1) infinite`, '--pxl-glitch-x': shift },
  };
}

/** What the drawn copies of a text glitch read while it plays: their shift and the length of the loop. */
export function glitchCopiesStyle({ duration, intensity }: GlitchAnimation): Record<string, string> {
  return { '--pxl-glitch-x': `${intensity}px`, '--pxl-glitch-duration': `${duration}ms` };
}
