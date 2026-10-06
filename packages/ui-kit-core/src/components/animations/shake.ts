/** PixelShake — a quick horizontal shake (keyframes `pxl-shake`). */
import { repeatToCss, type AnimationRepeat, type AnimationStyle } from './animation';

export interface ShakeAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Horizontal travel in pixels. */
  distance: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Timing function. */
  easing: string;
}

/** The wrapper's style while the shake plays; the keyframes read the travel from `--pxl-shake-distance`. */
export function shakeStyle({ duration, distance, repeat, easing }: ShakeAnimation): AnimationStyle {
  return {
    animation: `pxl-shake ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
    '--pxl-shake-distance': `${distance}px`,
  };
}
