/** PixelCheckbox — the checkbox button, its box and the check mark. */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

export interface CheckboxClassOptions {
  tone: Tone;
  checked: boolean;
  disabled: boolean;
}

export interface CheckboxClasses {
  /** The `role="checkbox"` button: box and label. */
  button: string;
  box: string;
  /** The check mark inside a checked box. */
  check: string;
  label: string;
}

/** Classes of every part of a PixelCheckbox. */
export function checkboxClasses(surface: Surface, { tone, checked, disabled }: CheckboxClassOptions): CheckboxClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return {
    button: cn(
      'group flex items-center gap-2.5 text-sm outline-none',
      s.font,
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ),
    box: cn(
      'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
      s.border,
      s.radius,
      checked ? cn(t.border, t.bg) : 'border-retro-border-strong bg-retro-bg',
      !disabled && 'group-hover:border-retro-muted',
      // The button draws no ring of its own: keyboard focus rings the box.
      'group-focus-visible:ring-2 group-focus-visible:ring-retro-green/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg',
    ),
    check: t.text,
    label: 'text-retro-text select-none',
  };
}
