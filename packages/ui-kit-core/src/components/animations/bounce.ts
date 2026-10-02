/** PixelBounce — a vertical bounce with damped follow-through (keyframes `pxl-bounce`). */
import { repeatToCss, type AnimationRepeat, type AnimationStyle } from './animation';

export interface BounceAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Peak height in pixels. */
  height: number;
  /** Timing function. */
  easing: string;
}

/** The wrapper's style while the bounce plays; the keyframes read the height from `--pxl-bounce-height`. */
export function bounceStyle({ duration, repeat, height, easing }: BounceAnimation): AnimationStyle {
  return {
    animation: `pxl-bounce ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
    '--pxl-bounce-height': `${height}px`,
  };
}
