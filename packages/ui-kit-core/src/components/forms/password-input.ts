/** PixelPasswordInput — the password field and its show / hide toggle. */
import { cn, fieldBase, focusRing, sizeHeight, surfaceClasses, toneMap, type Size, type Surface, type Tone } from '../../common';
import { fieldBorderClass } from './input';

export interface PasswordInputClassOptions {
  tone: Tone;
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
}

export interface PasswordInputClasses {
  /** Positions the toggle over the input. */
  shell: string;
  /** The input, padded on the right for the toggle. */
  input: string;
  /** The show / hide toggle inside the input. */
  toggle: string;
}

/** Classes of every part of a PixelPasswordInput. */
export function passwordInputClasses(surface: Surface, options: PasswordInputClassOptions): PasswordInputClasses {
  const s = surfaceClasses(surface);
  return {
    shell: 'relative block',
    input: cn(
      fieldBase,
      s.font,
      s.border,
      s.radius,
      s.transition,
      sizeHeight[options.size],
      focusRing,
      toneMap[options.tone].ring,
      fieldBorderClass(options.invalid),
      'px-3 pr-16',
    ),
    toggle: cn(
      'absolute right-1.5 top-1/2 -translate-y-1/2 border border-retro-border-strong bg-retro-surface/60 px-2 py-0.5 text-[10px] uppercase text-retro-muted transition-colors hover:text-retro-text disabled:opacity-50 disabled:cursor-not-allowed',
      s.font,
      s.radius,
    ),
  };
}
