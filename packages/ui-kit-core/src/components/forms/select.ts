/**
 * PixelSelect — the combobox trigger, its listbox and options, the ids that
 * tie them together and what each key does.
 */
import { cn, focusRing, sizeHeight, surfaceClasses, toneMap, type Size, type Surface, type Tone } from '../../common';
import { fieldBorderClass } from './input';

export interface SelectClassOptions {
  tone: Tone;
  size: Size;
  /** The field shows an error. */
  invalid: boolean;
  disabled: boolean;
  open: boolean;
  /** An option is selected; otherwise the trigger shows the placeholder. */
  hasValue: boolean;
}

export interface SelectClasses {
  /** Anchors the listbox under the trigger. */
  container: string;
  trigger: string;
  /** The icon and text of the selected option, or the placeholder. */
  triggerContent: string;
  /** An option's icon, in the trigger or the listbox. */
  icon: string;
  /** The selected option's label, or the placeholder. */
  value: string;
  chevron: string;
  listbox: string;
  /** The icon and label inside an option. */
  optionContent: string;
  optionLabel: string;
  /** The check mark of the selected option. */
  check: string;
}

/** Classes of every part of a PixelSelect except its options. */
export function selectClasses(surface: Surface, options: SelectClassOptions): SelectClasses {
  const s = surfaceClasses(surface);
  return {
    container: 'relative',
    trigger: cn(
      'flex w-full items-center justify-between bg-retro-surface/40 px-3 focus-visible:outline-hidden',
      s.font,
      s.border,
      s.radius,
      s.transition,
      sizeHeight[options.size],
      focusRing,
      toneMap[options.tone].ring,
      fieldBorderClass(options.invalid),
      options.disabled && 'opacity-50 cursor-not-allowed',
    ),
    triggerContent: 'flex min-w-0 items-center gap-2',
    icon: 'flex-shrink-0 opacity-80',
    value: cn('truncate', options.hasValue ? 'text-retro-text' : 'text-retro-muted'),
    chevron: cn('ml-2 flex-shrink-0 text-retro-muted transition-transform', options.open && 'rotate-180'),
    listbox: cn(
      'absolute left-0 top-full z-40 mt-1 w-full bg-retro-bg p-1 shadow-xl',
      s.border,
      s.radiusLg,
      'border-retro-border-strong',
    ),
    optionContent: 'flex flex-1 min-w-0 items-center gap-2',
    optionLabel: 'truncate',
    check: 'ml-auto flex-shrink-0 h-2.5 w-2.5',
  };
}

export interface SelectOptionClassOptions {
  tone: Tone;
  selected: boolean;
  /** The keyboard or the pointer highlights the option. */
  highlighted: boolean;
}

/** One option of the listbox. */
export function selectOptionClasses(surface: Surface, { tone, selected, highlighted }: SelectOptionClassOptions): string {
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return cn(
    'flex w-full items-center px-3 py-2 text-left text-xs transition-colors',
    s.font,
    s.radius,
    selected ? cn(t.text, t.soft) : 'text-retro-muted',
    highlighted && 'bg-retro-surface',
    'hover:bg-retro-surface hover:text-retro-text',
  );
}

/** Id of the listbox of the select whose trigger has the id `triggerId`. */
export function selectListboxId(triggerId: string): string {
  return `${triggerId}-listbox`;
}

/** Id of the option at `index` of that select. */
export function selectOptionId(triggerId: string, index: number): string {
  return `${triggerId}-option-${index}`;
}

export interface SelectKeyState {
  open: boolean;
  /** Index of the highlighted option, `-1` for none. */
  highlighted: number;
}

export interface SelectKeyResult extends SelectKeyState {
  /** The key's default action must be prevented. */
  preventDefault: boolean;
  /** Index of the option to select; the listbox then closes. */
  select?: number;
}

/**
 * What a key pressed on the trigger does, or `null` for a key the select
 * leaves alone. Enter and Space open the listbox, or select the highlighted
 * option; the arrows move the highlight (ArrowDown also opens); Home and End
 * open on the first or last option; Escape and Tab close.
 */
export function selectKeydown(
  key: string,
  { open, highlighted }: SelectKeyState,
  optionCount: number,
): SelectKeyResult | null {
  switch (key) {
    case 'Escape':
    case 'Tab':
      return { preventDefault: false, open: false, highlighted };
    case 'Enter':
    case ' ':
      return open && highlighted >= 0
        ? { preventDefault: true, open: false, highlighted, select: highlighted }
        : { preventDefault: true, open: true, highlighted };
    case 'ArrowDown':
      return open
        ? { preventDefault: true, open, highlighted: Math.min(highlighted + 1, optionCount - 1) }
        : { preventDefault: true, open: true, highlighted: 0 };
    case 'ArrowUp':
      return { preventDefault: true, open, highlighted: Math.max(highlighted - 1, 0) };
    case 'Home':
      return { preventDefault: true, open: true, highlighted: 0 };
    case 'End':
      return { preventDefault: true, open: true, highlighted: optionCount - 1 };
    default:
      return null;
  }
}
