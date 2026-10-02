import { ChangeDetectionStrategy, Component, computed, contentChildren, inject, input, output } from '@angular/core';
import {
  stepClickable,
  stepperClasses,
  stepperFocusTarget,
  type StepperOrientation,
  type StepperSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, numberOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';
import { PixelStepperStep } from './pixel-stepper-step';
import { PIXEL_STEPPER, type PixelStepperContext } from './stepper-context';

/**
 * Multi-step progress indicator: its `<pxl-stepper-step>`s in a
 * `role="group"`, joined by connectors that turn green once a step is done.
 * Each step is pending, active (`aria-current="step"`), completed or in error.
 * With `clickable`, the steps up to the active one — every step with
 * `allowNextStepsSelect` — emit `(stepClick)` and take focus from the
 * keyboard: the arrow keys of the orientation, Home and End move between them
 * without wrapping, and Enter or Space activates one. The host is the group.
 *
 * @example
 * <pxl-stepper [active]="active()" clickable (stepClick)="active.set($event)">
 *   <pxl-stepper-step label="Account" description="Create your account" />
 *   <pxl-stepper-step label="Profile" />
 * </pxl-stepper>
 */
@Component({
  selector: 'pxl-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PIXEL_STEPPER, useFactory: () => inject(PixelStepper).context }],
  host: {
    'data-pxl-stepper': 'true',
    '[attr.data-pxl-orientation]': 'orientation()',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class PixelStepper {
  /** Index of the current step, from 0. */
  readonly active = input.required<number, unknown>({ transform: numberOr(0) });
  /** Makes the steps up to the active one clickable: they emit `(stepClick)`. */
  readonly clickable = input(false, { transform: booleanOr(false) });
  /** Steps in a row or a column; also the arrow keys that move between them. */
  readonly orientation = input<StepperOrientation, StepperOrientation | undefined>('horizontal', {
    transform: withDefault<StepperOrientation>('horizontal'),
  });
  /** With `clickable`, makes the steps after the active one clickable too. */
  readonly allowNextStepsSelect = input(false, { transform: booleanOr(false) });
  /** Size of the indicators and labels. */
  readonly size = input<StepperSize, StepperSize | undefined>('md', { transform: withDefault<StepperSize>('md') });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible name of the group. */
  readonly ariaLabel = input<string, string | undefined>('Progress steps', { transform: withDefault('Progress steps') });
  /** A clickable step was clicked, or activated with Enter or Space: its index. */
  readonly stepClick = output<number>();

  private readonly steps = contentChildren(PixelStepperStep);
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => stepperClasses(this.effectiveSurface(), this.orientation()));

  /** @internal Shared with the steps. */
  readonly context: PixelStepperContext = {
    active: this.active,
    orientation: this.orientation,
    size: this.size,
    surface: this.effectiveSurface,
    steps: this.steps,
    isClickable: (index) =>
      stepClickable(index, this.active(), { handler: this.clickable(), allowNextStepsSelect: this.allowNextStepsSelect() }),
    select: (index) => this.stepClick.emit(index),
    moveFocus: (from, move) => {
      const steps = this.steps();
      const target = stepperFocusTarget(from, move, steps.length, this.context.isClickable);
      if (target !== undefined) steps[target]!.focus();
    },
  };
}
