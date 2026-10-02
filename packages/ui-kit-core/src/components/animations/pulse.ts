/** PixelPulse — gently scales and dims its content (keyframes `pxl-pulse`). */
import { repeatToCss, type AnimationRepeat, type AnimationStyle } from './animation';

export interface PulseAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Timing function. */
  easing: string;
}

/** The wrapper's style while the pulse plays. */
export function pulseStyle({ duration, repeat, easing }: PulseAnimation): AnimationStyle {
  return { animation: `pxl-pulse ${duration}ms ${easing} 0ms ${repeatToCss(repeat)} both` };
}
