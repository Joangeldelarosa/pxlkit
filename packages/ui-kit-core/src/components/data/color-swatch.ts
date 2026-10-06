/** PixelColorSwatch — a colour sample beside its token name and CSS variable. */
import { cn, surfaceClasses, type Surface } from '../../common';

export interface ColorSwatchClasses {
  root: string;
  /** The square filled with the colour. */
  sample: string;
  /** The token name. */
  name: string;
  /** The CSS variable. */
  variable: string;
}

/** Classes of every part of the swatch. */
export function colorSwatchClasses(surface: Surface): ColorSwatchClasses {
  const s = surfaceClasses(surface);
  return {
    root: 'flex items-center gap-3',
    sample: cn('h-8 w-8', s.border, s.radius, 'border-retro-border/50'),
    name: cn('text-xs text-retro-text', s.font),
    variable: cn('text-[10px] text-retro-muted', s.font),
  };
}

/** The sample's fill: the variable itself, so the swatch follows the active theme. */
export function colorSwatchFill(cssVar: string): string {
  return `var(${cssVar})`;
}
