/**
 * PixelGlitch — a CRT glitch in three layers: the content, sliced and shifted
 * (keyframes `pxl-glitch`), under two colour-split copies of it that flash on
 * other slices (`pxl-glitch-r`, `pxl-glitch-c`).
 */
import type { AnimationStyle } from './animation';

export const glitchClasses = {
  /** The wrapper the ghost layers are positioned in. */
  root: 'relative inline-block overflow-visible',
  /** A ghost layer: a copy of the content over it, which the pointer goes through. */
  ghost: 'pointer-events-none absolute inset-0',
};

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
