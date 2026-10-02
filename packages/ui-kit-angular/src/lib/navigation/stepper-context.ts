import { InjectionToken, inject, type Signal } from '@angular/core';
import type { StepperMove, StepperOrientation, StepperSize, Surface } from '@pxlkit/ui-kit-core';

/** A step, as the stepper sees it. */
export interface StepperStepEntry {
  /** Focuses the step element. */
  focus(): void;
}

/** What a `<pxl-stepper>` shares with its steps. */
export interface PixelStepperContext {
  readonly active: Signal<number>;
  readonly orientation: Signal<StepperOrientation>;
  readonly size: Signal<StepperSize>;
  readonly surface: Signal<Surface>;
  /** The steps, in order. */
  readonly steps: Signal<readonly StepperStepEntry[]>;
  /** Whether the step at `index` is clickable. */
  isClickable(index: number): boolean;
  /** Emits the stepper's `(stepClick)` for the step at `index`. */
  select(index: number): void;
  /** Focuses the clickable step a key moves to from step `from`, if any. */
  moveFocus(from: number, move: StepperMove): void;
}

export const PIXEL_STEPPER = new InjectionToken<PixelStepperContext>('PIXEL_STEPPER');

export function injectStepperContext(): PixelStepperContext {
  const context = inject(PIXEL_STEPPER, { optional: true });
  if (!context) throw new Error('PixelStepperStep must be used inside <pxl-stepper>');
  return context;
}
