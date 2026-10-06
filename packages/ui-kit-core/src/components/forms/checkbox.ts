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

/** The tone's focus ring, drawn while the control's button (the `group`) has keyboard focus. */
const GROUP_FOCUS_RING: Record<Tone, string> = {
  green: 'group-focus-visible:ring-retro-green/40',
  cyan: 'group-focus-visible:ring-retro-cyan/40',
  gold: 'group-focus-visible:ring-retro-gold/40',
  red: 'group-focus-visible:ring-retro-red/40',
  purple: 'group-focus-visible:ring-retro-purple/40',
  pink: 'group-focus-visible:ring-retro-pink/40',
  neutral: 'group-focus-visible:ring-retro-border/60',
};

/**
 * The keyboard focus of a checkbox or radio button, drawn on its box: the
 * button draws none of its own. A ring in the tone around the box on the
 * linear surface; on the pixel surface the box's cut corners would clip a
 * ring, so its edge lights up instead.
 */
export function indicatorFocusClasses(surface: Surface, tone: Tone): string {
  return surface === 'pixel'
    ? 'group-focus-visible:pxl-focus-inset'
    : cn('group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-retro-bg', GROUP_FOCUS_RING[tone]);
}

/** Classes of every part of a PixelCheckbox. */
export function checkboxClasses(surface: Surface, { tone, checked, disabled }: CheckboxClassOptions): CheckboxClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return {
    button: cn(
      'group flex items-center gap-2.5 text-sm focus-visible:outline-hidden',
      s.font,
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ),
    box: cn(
      'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
      s.border,
      s.radius,
      checked ? cn(t.border, t.bg) : 'border-retro-border-strong bg-retro-bg',
      !disabled && 'group-hover:border-retro-muted',
      indicatorFocusClasses(surface, tone),
    ),
    check: t.text,
    label: 'text-retro-text select-none',
  };
}
