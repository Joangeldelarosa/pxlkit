/** PixelFadeIn — fades its content in, from transparent to opaque (keyframes `pxl-fade-in`). */
import { repeatToCss, type AnimationFillMode, type AnimationRepeat, type AnimationStyle } from './animation';

export interface FadeInAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Delay in milliseconds. */
  delay: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Timing function. */
  easing: string;
  /** Fill mode. */
  fillMode: AnimationFillMode;
}

/** The wrapper's style while the fade plays. */
export function fadeInStyle({ duration, delay, repeat, easing, fillMode }: FadeInAnimation): AnimationStyle {
  return { animation: `pxl-fade-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}` };
}
