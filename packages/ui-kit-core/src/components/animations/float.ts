/** PixelFloat — a gentle vertical sine loop (keyframes `pxl-float`). */
import { repeatToCss, type AnimationRepeat, type AnimationStyle } from './animation';

export interface FloatAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Vertical travel in pixels. */
  distance: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Timing function. */
  easing: string;
}

/** The wrapper's style while the float plays; the keyframes read the travel from `--pxl-float-distance`. */
export function floatStyle({ duration, distance, repeat, easing }: FloatAnimation): AnimationStyle {
  return {
    animation: `pxl-float ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
    '--pxl-float-distance': `${distance}px`,
  };
}
