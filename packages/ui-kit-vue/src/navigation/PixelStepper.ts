import {
  Fragment,
  Text,
  computed,
  defineComponent,
  h,
  provide,
  type ExtractPublicPropTypes,
  type PropType,
  type SlotsType,
  type VNode,
} from 'vue';
import {
  stepClickable,
  stepConnectorClasses,
  stepConnectorCompleted,
  stepperClasses,
  stepperFocusTarget,
  stepperSlotClasses,
  type StepperOrientation,
  type StepperSize,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { slotNodes } from '../_internal/Slot.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { PIXEL_STEPPER, StepPosition } from './_internal/stepper-context.js';

const stepperProps = {
  /** Index of the current step, from 0. */
  active: { type: Number, required: true },
  /**
   * Called with the index of a step that is clicked, or activated with Enter
   * or Space (bind it as `@step-click`). With it, the steps up to the active
   * one — every step with `allowNextStepsSelect` — are clickable and in the
   * tab order.
   */
  onStepClick: { type: Function as PropType<(index: number) => void>, default: undefined },
  /** Steps in a row or a column; also the arrow keys that move between them. */
  orientation: { type: String as PropType<StepperOrientation>, default: 'horizontal' },
  /** Makes the steps after the active one clickable too. */
  allowNextStepsSelect: { type: Boolean, default: false },
  /** Size of the indicators and labels. */
  size: { type: String as PropType<StepperSize>, default: 'md' },
  /** Surface override; defaults to the nearest provider. */
  surface: { type: String as PropType<Surface>, default: undefined },
  /** Accessible name of the group. */
  ariaLabel: { type: String, default: 'Progress steps' },
} as const;

export type PixelStepperProps = ExtractPublicPropTypes<typeof stepperProps>;

/**
 * Multi-step progress indicator: the `PixelStepperStep`s of its default slot
 * in a `role="group"`, joined by connectors that turn green once a step is
 * done. Each step is pending, active (`aria-current="step"`), completed or in
 * error. With `@step-click`, clickable steps take focus from the keyboard:
 * the arrow keys of the orientation, Home and End move between them without
 * wrapping, and Enter or Space activates one. Attributes go to the group.
 *
 * @example
 * <PixelStepper :active="active" @step-click="active = $event">
 *   <PixelStepperStep label="Account" description="Create your account" />
 *   <PixelStepperStep label="Profile" />
 * </PixelStepper>
 */
export default defineComponent({
  name: 'PixelStepper',
  props: stepperProps,
  slots: Object as SlotsType<{
    /** The steps. */
    default?: () => VNode[];
  }>,
  setup(props, { slots }) {
    const surface = useEffectiveSurface(() => props.surface);
    const steps = new Map<number, HTMLElement>();
    const clickable = (index: number) =>
      stepClickable(index, props.active, { handler: !!props.onStepClick, allowNextStepsSelect: props.allowNextStepsSelect });

    provide(PIXEL_STEPPER, {
      active: computed(() => props.active),
      orientation: computed(() => props.orientation),
      size: computed(() => props.size),
      surface,
      clickable,
      select: (index) => props.onStepClick?.(index),
      registerStep(index, element) {
        steps.set(index, element);
        return () => {
          if (steps.get(index) === element) steps.delete(index);
        };
      },
      moveFocus(from, move, total) {
        const target = stepperFocusTarget(from, move, total, clickable);
        if (target !== undefined) steps.get(target)?.focus();
      },
    });

    return () => {
      // Like React's `Children.toArray(…).filter(isValidElement)`: text is not a step.
      const children = slotNodes(slots.default?.()).filter((node) => node.type !== Text);
      const total = children.length;
      const vertical = props.orientation === 'vertical';
      return h(
        'div',
        {
          'data-pxl-stepper': 'true',
          'data-pxl-orientation': props.orientation,
          role: 'group',
          'aria-label': props.ariaLabel,
          class: stepperClasses(surface.value, props.orientation),
        },
        children.map((child, index) => {
          const parts = [h(StepPosition, { index, total }, () => child)];
          if (index < total - 1) {
            parts.push(
              h(vertical ? 'span' : 'hr', {
                'aria-hidden': 'true',
                'data-pxl-step-connector': 'true',
                'data-pxl-step-connector-orientation': props.orientation,
                class: stepConnectorClasses(props.orientation, props.size, stepConnectorCompleted(index, props.active)),
              }),
            );
          }
          return vertical ? h('div', { key: index, class: stepperSlotClasses }, parts) : h(Fragment, { key: index }, parts);
        }),
      );
    };
  },
});
