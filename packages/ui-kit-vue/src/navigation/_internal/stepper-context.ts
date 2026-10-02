import { defineComponent, inject, provide, type ComputedRef, type InjectionKey } from 'vue';
import type { StepperMove, StepperOrientation, StepperSize, Surface } from '@pxlkit/ui-kit-core';

/** What a `PixelStepper` shares with its steps. */
export interface PixelStepperContext {
  active: ComputedRef<number>;
  orientation: ComputedRef<StepperOrientation>;
  size: ComputedRef<StepperSize>;
  surface: ComputedRef<Surface>;
  /** Whether the step at `index` is clickable. */
  clickable(index: number): boolean;
  /** Runs the stepper's step handler for the step at `index`. */
  select(index: number): void;
  /** Lists a step's element while it is rendered; returns the function that removes it. */
  registerStep(index: number, element: HTMLElement): () => void;
  /** Focuses the clickable step a key moves to from step `from` of `total`, if any. */
  moveFocus(from: number, move: StepperMove, total: number): void;
}

/** Where a step sits in its stepper. */
export interface PixelStepperPosition {
  index: number;
  total: number;
}

export const PIXEL_STEPPER: InjectionKey<PixelStepperContext> = Symbol('pixel-stepper');
const PIXEL_STEPPER_POSITION: InjectionKey<Readonly<PixelStepperPosition>> = Symbol('pixel-stepper-position');

const UNPLACED: PixelStepperPosition = { index: -1, total: 0 };

export function useStepperContext(): PixelStepperContext {
  const context = inject(PIXEL_STEPPER, null);
  if (!context) throw new Error('PixelStepperStep must be used inside <PixelStepper>');
  return context;
}

/** The position the stepper gave the calling step (reactive). */
export function useStepPosition(): Readonly<PixelStepperPosition> {
  return inject(PIXEL_STEPPER_POSITION, UNPLACED);
}

/**
 * Wraps each child of a stepper (rendering nothing of its own) to give it its
 * position, so a step still finds it when the consumer wraps
 * `PixelStepperStep` in a component of their own.
 */
export const StepPosition = defineComponent({
  name: 'PxlStepPosition',
  props: {
    index: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  setup(props, { slots }) {
    provide(PIXEL_STEPPER_POSITION, props);
    return () => slots.default?.();
  },
});
