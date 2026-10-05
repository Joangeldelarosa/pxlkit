/**
 * PixelDivider — a horizontal rule, or two rules around a label. The pixel
 * surface draws dotted rules (and diamond ornaments around the label).
 */
import { cn, toneMap, type Surface, type Tone } from '../../common';

export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

/** Symmetric vertical padding. */
export const dividerSpacingClasses: Record<DividerSpacing, string> = {
  none: '',
  sm: 'py-3',
  md: 'py-6',
  lg: 'py-10',
};

export interface DividerClasses {
  /** The rule on its own, without a label. */
  rule: string;
  /** The labelled separator around the rules and the label. */
  separator: string;
  /** Each of the two rules beside the label. */
  line: string;
  label: string;
}

/** The parts of the divider for a surface, spacing and label tone. */
export function dividerClasses(surface: Surface, spacing: DividerSpacing, tone: Tone): DividerClasses {
  const pixel = surface === 'pixel';
  const spacingClasses = dividerSpacingClasses[spacing];
  const rule = pixel ? 'border-t-2 border-dotted' : 'border-t';
  return {
    rule: cn(rule, 'border-retro-border/40', spacingClasses),
    separator: cn('flex items-center gap-3', spacingClasses),
    line: cn(rule, 'flex-1 border-retro-border/40'),
    label: cn(
      'text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5',
      // Linear's display weight without its letter-spacing: the label sets its own.
      pixel ? 'font-pixel' : 'font-semibold',
      toneMap[tone].text,
    ),
  };
}
