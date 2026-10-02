/** PixelZoomIn — scales its content up to full size while it fades in (keyframes `pxl-zoom-in`). */
import { repeatToCss, type AnimationFillMode, type AnimationRepeat, type AnimationStyle } from './animation';

export interface ZoomInAnimation {
  /** Duration in milliseconds. */
  duration: number;
  /** Delay in milliseconds. */
  delay: number;
  /** Starting `scale()` factor. */
  startScale: number;
  /** Iteration count. */
  repeat: AnimationRepeat;
  /** Timing function. */
  easing: string;
  /** Fill mode. */
  fillMode: AnimationFillMode;
}

/** The wrapper's style while the zoom plays; the keyframes read the starting scale from `--pxl-zoom-start`. */
export function zoomInStyle({
  duration,
  delay,
  startScale,
  repeat,
  easing,
  fillMode,
}: ZoomInAnimation): AnimationStyle {
  return {
    animation: `pxl-zoom-in ${duration}ms ${easing} ${delay}ms ${repeatToCss(repeat)} ${fillMode}`,
    '--pxl-zoom-start': String(startScale),
  };
}
