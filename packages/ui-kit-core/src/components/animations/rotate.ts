/** PixelRotate — a full turn, in the direction asked for (keyframes `pxl-rotate`). */
import { repeatToCss, type AnimationDirection, type AnimationRepeat, type AnimationStyle } from './animation';

export interface RotateAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Direction of the turns. */
  direction: AnimationDirection;
  /** Timing function. */
  easing: string;
}

/**
 * The wrapper's style while the rotation plays. The direction follows the
 * shorthand, which resets it.
 */
export function rotateStyle({ duration, repeat, direction, easing }: RotateAnimation): AnimationStyle {
  return {
    animation: `pxl-rotate ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both`,
    animationDirection: direction,
  };
}
