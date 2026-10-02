/**
 * PixelStepper — a row (or column) of steps in a `role="group"`, joined by
 * connectors. Each step is pending, active, completed or in error, with an
 * indicator (its number, a check mark, a cross, a custom icon or a spinner)
 * and a label. With a step handler, the steps up to the active one — every
 * step with `allowNextStepsSelect` — are clickable and in the tab order; the
 * arrow keys of the orientation, Home and End move focus between them
 * without wrapping, and Enter or Space activates one.
 */
import { cn, focusRing, surfaceClasses, toneMap, type Surface, type Tone } from '../../common';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';
export type StepState = 'pending' | 'active' | 'completed' | 'error';

/** An error wins over completion, which wins over being the active step. */
export function stepState(
  index: number,
  active: number,
  { completed = false, error = false }: { completed?: boolean; error?: boolean },
): StepState {
  if (error) return 'error';
  if (completed) return 'completed';
  return index === active ? 'active' : 'pending';
}

/** The tone of a step in each state. */
export const stepTones: Record<StepState, Tone> = {
  error: 'red',
  completed: 'green',
  active: 'cyan',
  pending: 'neutral',
};

/** What the indicator shows: a spinner while loading, else the mark of the state, a custom icon or the number. */
export type StepIndicator = 'loading' | 'check' | 'error' | 'custom' | 'number';

export function stepIndicator(state: StepState, { loading = false, icon = false }: { loading?: boolean; icon?: boolean }): StepIndicator {
  if (loading) return 'loading';
  if (state === 'completed') return 'check';
  if (state === 'error') return 'error';
  return icon ? 'custom' : 'number';
}

const STATE_SUFFIX: Record<StepState, string> = {
  completed: ' (completed)',
  error: ' (error)',
  active: ' (current)',
  pending: '',
};

/** The accessible name of a step: its position, its label and its state. */
export function stepAriaLabel(index: number, total: number, label: string, state: StepState): string {
  return `Step ${index + 1} of ${total}: ${label}${STATE_SUFFIX[state]}`;
}

/**
 * Whether the step at `index` is clickable: only with a step handler, and
 * then up to the active step, or every step with `allowNextStepsSelect`.
 */
export function stepClickable(
  index: number,
  active: number,
  { handler, allowNextStepsSelect }: { handler: boolean; allowNextStepsSelect: boolean },
): boolean {
  return handler && (allowNextStepsSelect || index <= active);
}

/** Where a key moves focus: to the next or previous clickable step, or to the first or last one. */
export type StepperMove = 1 | -1 | 'first' | 'last';

/**
 * What a key pressed on a step does: the arrows of the orientation move
 * focus, Home and End jump to the ends, Enter and Space activate the step.
 * `undefined` for any other key.
 */
export function stepperKeyAction(key: string, orientation: StepperOrientation): StepperMove | 'select' | undefined {
  const vertical = orientation === 'vertical';
  switch (key) {
    case vertical ? 'ArrowDown' : 'ArrowRight':
      return 1;
    case vertical ? 'ArrowUp' : 'ArrowLeft':
      return -1;
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    case 'Enter':
    case ' ':
      return 'select';
    default:
      return undefined;
  }
}

/**
 * The step a move from step `from` focuses among `total` steps: the nearest
 * clickable one in that direction, or the first or last clickable one; it
 * does not wrap. `undefined` when there is none.
 */
export function stepperFocusTarget(
  from: number,
  move: StepperMove,
  total: number,
  clickable: (index: number) => boolean,
): number | undefined {
  if (move === 'first' || move === 'last') {
    for (let i = 0; i < total; i++) {
      const index = move === 'first' ? i : total - 1 - i;
      if (clickable(index)) return index;
    }
    return undefined;
  }
  for (let index = from + move; index >= 0 && index < total; index += move) {
    if (clickable(index)) return index;
  }
  return undefined;
}

/** The step between two connectors is done once the active step is past it. */
export function stepConnectorCompleted(index: number, active: number): boolean {
  return index < active;
}

/** The root, a row or a column. */
export function stepperClasses(surface: Surface, orientation: StepperOrientation): string {
  return cn('w-full', orientation === 'vertical' ? 'flex flex-col gap-0' : 'flex items-start gap-0', surfaceClasses(surface).font);
}

/** In a vertical stepper, the column that holds a step and the connector below it. */
export const stepperSlotClasses = 'flex flex-col';

/** The connector after a step, green once the step is done. */
export function stepConnectorClasses(orientation: StepperOrientation, size: StepperSize, completed: boolean): string {
  const fill = completed ? toneMap.green.fill : 'bg-retro-border/40';
  if (orientation === 'vertical') {
    // Runs under the middle of the indicator.
    const indent = size === 'sm' ? 'ml-3' : size === 'md' ? 'ml-4' : 'ml-5';
    return cn('mx-auto my-1 block w-0.5 self-start', indent, 'h-6', fill);
  }
  const offset = size === 'sm' ? 'mt-3' : size === 'md' ? 'mt-4' : 'mt-5';
  return cn('flex-1 border-0 h-0.5 self-start', offset, 'mx-1', fill);
}

/** Indicator dimensions and type size per size. */
export const stepIndicatorSizeClasses: Record<StepperSize, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

/** Label type size per size. */
export const stepLabelSizeClasses: Record<StepperSize, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
};

/** Description type size per size. */
export const stepDescriptionSizeClasses: Record<StepperSize, string> = {
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-xs',
};

/**
 * The ring around the active step's indicator: the cyan tone's focus ring,
 * shown at all times — spelled out so Tailwind generates it.
 */
const ACTIVE_INDICATOR_RING = 'ring-retro-cyan/40';

export interface StepClassOptions {
  orientation: StepperOrientation;
  size: StepperSize;
  state: StepState;
  clickable: boolean;
}

export interface StepClasses {
  /** The step. */
  root: string;
  /** The indicator. */
  indicator: string;
  /** The number shown in the indicator. */
  number: string;
  /** The check mark, the cross or the custom icon in the indicator. */
  icon: string;
  /** The spinner in the indicator while loading. */
  spinner: string;
  /** Holds the label and the description. */
  body: string;
  label: string;
  description: string;
}

/** Classes of every part of a step. */
export function stepClasses(surface: Surface, { orientation, size, state, clickable }: StepClassOptions): StepClasses {
  const s = surfaceClasses(surface);
  const t = toneMap[stepTones[state]];
  const vertical = orientation === 'vertical';
  return {
    root: cn(
      'group relative flex',
      vertical ? 'flex-row items-start gap-3' : 'flex-1 flex-col items-center text-center gap-1.5',
      clickable && cn('cursor-pointer outline-none', focusRing, t.ring, 'rounded-[2px]'),
      !clickable && 'cursor-default',
    ),
    indicator: cn(
      'inline-flex items-center justify-center shrink-0',
      stepIndicatorSizeClasses[size],
      s.border,
      s.radius,
      s.transition,
      t.border,
      state === 'pending' ? 'bg-retro-surface/40' : t.bg,
      state === 'active' && 'ring-2 ring-offset-1 ring-offset-retro-bg',
      state === 'active' && ACTIVE_INDICATOR_RING,
    ),
    number: cn('font-semibold', s.font, t.text),
    icon: cn('inline-flex', t.text),
    spinner: cn('animate-spin h-3.5 w-3.5', t.text),
    body: cn('flex flex-col', vertical ? 'items-start pt-0.5' : 'items-center'),
    label: cn(stepLabelSizeClasses[size], s.font, 'font-semibold leading-tight', state === 'pending' ? 'text-retro-muted' : t.text),
    description: cn(stepDescriptionSizeClasses[size], s.font, 'mt-0.5 text-retro-muted leading-snug'),
  };
}

/** A segment of the loading spinner: `[x, y, width, height, opacity]` on a 16×16 grid. */
export type StepSpinnerRect = readonly [x: number, y: number, width: number, height: number, opacity: number];

/** The loading spinner: eight segments fading round the circle. */
export const stepSpinner: { viewBox: string; rects: readonly StepSpinnerRect[] } = {
  viewBox: '0 0 16 16',
  rects: [
    [7, 1, 2, 3, 0.9],
    [11, 2, 2, 2, 0.7],
    [12, 7, 3, 2, 0.55],
    [11, 12, 2, 2, 0.4],
    [7, 12, 2, 3, 0.3],
    [3, 12, 2, 2, 0.25],
    [1, 7, 3, 2, 0.2],
    [3, 2, 2, 2, 0.15],
  ],
};
