/** PixelFlicker — the stepped opacity flicker of a broken neon sign (keyframes `pxl-flicker`). */
import { repeatToCss, type AnimationRepeat, type AnimationStyle } from './animation';

export interface FlickerAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
}

/** The wrapper's style while the flicker plays. */
export function flickerStyle({ duration, repeat }: FlickerAnimation): AnimationStyle {
  return { animation: `pxl-flicker ${duration}ms steps(1) 0ms ${repeatToCss(repeat)} both` };
}
