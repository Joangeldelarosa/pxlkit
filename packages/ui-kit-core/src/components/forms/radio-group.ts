/** PixelRadioGroup — the fieldset, its legend and the radios with their dot indicator. */
import { cn, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';
import { indicatorFocusClasses } from './checkbox';

export interface RadioGroupClasses {
  /** The `<fieldset role="radiogroup">`. */
  group: string;
  legend: string;
  /** Each `role="radio"` button. */
  radio: string;
  label: string;
}

/** Classes of the group and of every radio in it. */
export function radioGroupClasses(surface: Surface, disabled: boolean): RadioGroupClasses {
  const s = surfaceClasses(surface);
  return {
    group: 'space-y-2',
    legend: cn('mb-1.5 text-xs text-retro-muted', s.font),
    radio: cn(
      'group flex items-center gap-2.5 text-sm focus-visible:outline-hidden',
      s.font,
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ),
    label: 'text-retro-text select-none',
  };
}

export interface RadioIndicatorOptions {
  tone: Tone;
  checked: boolean;
  disabled: boolean;
}

export interface RadioIndicatorClasses {
  /** The box around the dot: square on the pixel surface, round on the linear one; it draws the radio's keyboard focus. */
  indicator: string;
  /** The dot of the checked radio. */
  dot: string;
}

/** Classes of one radio's indicator. */
export function radioIndicatorClasses(
  surface: Surface,
  { tone, checked, disabled }: RadioIndicatorOptions,
): RadioIndicatorClasses {
  const t = toneMap[tone];
  const pixel = surface === 'pixel';
  return {
    indicator: cn(
      'flex h-[18px] w-[18px] shrink-0 items-center justify-center transition-all',
      surfaceClasses(surface).border,
      pixel ? 'rounded-[2px]' : 'rounded-full',
      checked ? cn(t.border, t.bg) : 'border-retro-border-strong bg-retro-bg',
      !disabled && 'group-hover:border-retro-muted',
      indicatorFocusClasses(surface, tone),
    ),
    dot: cn('block h-2 w-2', pixel ? 'rounded-[1px]' : 'rounded-full', t.fill),
  };
}
