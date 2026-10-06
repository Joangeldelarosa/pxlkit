/** PixelSlideIn — slides its content in from one edge (keyframes `pxl-slide-up`, `-down`, `-left`, `-right`). */
import { repeatToCss, type AnimationFillMode, type AnimationRepeat, type AnimationStyle } from './animation';

/** The edge the content slides in from. */
export type SlideInFrom = 'up' | 'down' | 'left' | 'right';

const SLIDE_KEYFRAMES: Record<SlideInFrom, string> = {
  up: 'pxl-slide-up',
  down: 'pxl-slide-down',
  left: 'pxl-slide-left',
  right: 'pxl-slide-right',
};

export interface SlideInAnimation {
  /** Edge to slide from. */
  from: SlideInFrom;
  /** Duration in milliseconds. */
  duration: number;
  /** Delay in milliseconds. */
  delay: number;
  /** Travel in pixels. */
  distance: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Timing function. */
  easing: string;
  /** Fill mode. */
  fillMode: AnimationFillMode;
}

/** The wrapper's style while the slide plays; the keyframes read the travel from `--pxl-slide-distance`. */
export function slideInStyle({
  from,
  duration,
  delay,
  distance,
  repeat,
  easing,
  fillMode,
}: SlideInAnimation): AnimationStyle {
  return {
    animation: `${SLIDE_KEYFRAMES[from]} ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}`,
    '--pxl-slide-distance': `${distance}px`,
  };
}
