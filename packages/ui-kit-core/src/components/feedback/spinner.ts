/**
 * PixelSpinner — a compact loading indicator: a square blade turning in eight
 * steps on the pixel surface, a smoothly spinning ring on the linear one.
 */
import { cn, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

/** Accessible name of a spinner without its own label. */
export const SPINNER_DEFAULT_LABEL = 'Loading';

/** Box size per spinner size. */
export const spinnerSizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

/** Ring width of the linear spinner per size. */
const linearBorderClasses: Record<SpinnerSize, string> = {
  xs: 'border',
  sm: 'border',
  md: 'border-2',
  lg: 'border-2',
};

export interface SpinnerClasses {
  root: string;
  /** The turning part. */
  blade: string;
}

/** Classes of the spinner and its blade for a surface, size and tone. */
export function spinnerClasses(surface: Surface, size: SpinnerSize, tone: ToneKey): SpinnerClasses {
  const text = toneTokens[tone].text;
  return {
    root: cn('relative inline-flex items-center justify-center align-middle', spinnerSizeClasses[size], text),
    blade:
      surface === 'pixel'
        ? cn('block h-full w-full border-2 border-retro-border/40 border-t-current border-l-current', text)
        : cn('block h-full w-full rounded-full', linearBorderClasses[size], 'border-retro-border/40 border-t-current', text),
  };
}

/**
 * The blade's `animation` (keyframes `pxl-spinner-steps` / `pxl-spinner-smooth`),
 * or none when the user prefers reduced motion — the shape stays, frozen.
 */
export function spinnerAnimation(surface: Surface, { reducedMotion }: { reducedMotion: boolean }): string | undefined {
  if (reducedMotion) return undefined;
  return surface === 'pixel' ? 'pxl-spinner-steps 0.8s steps(8) infinite' : 'pxl-spinner-smooth 0.6s linear infinite';
}
