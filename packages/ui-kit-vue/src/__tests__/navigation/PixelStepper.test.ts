/**
 * PixelStepper beyond the parity examples: `@step-click` makes steps
 * clickable and reports them without moving the active step, the vertical
 * arrow keys, the `#icon` slot, steps wrapped in a component of their own,
 * and the attributes that fall through to the group.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelStepper, PixelStepperStep } from '../../index';

const steps = (count: number) => Array.from({ length: count }, (_, i) => h(PixelStepperStep, { label: `Step ${i + 1}` }));
const stepsOf = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('[data-pxl-step]');

describe('PixelStepper', () => {
  it('reports clicked steps up to the active one through @step-click, without moving the active step', async () => {
    const onStepClick = vi.fn();
    const wrapper = mount(PixelStepper, { props: { active: 1, onStepClick }, slots: { default: () => steps(3) } });
    expect(stepsOf(wrapper).map((step) => step.attributes('tabindex'))).toEqual(['0', '0', undefined]);
    expect(stepsOf(wrapper).map((step) => step.attributes('role'))).toEqual(['button', 'button', undefined]);
    await stepsOf(wrapper)[0]!.trigger('click');
    await stepsOf(wrapper)[2]!.trigger('click');
    expect(onStepClick.mock.calls).toEqual([[0]]);
    expect(stepsOf(wrapper)[1]!.attributes('aria-current')).toBe('step');
  });

  it('keeps every step out of the tab order without a step handler', () => {
    const wrapper = mount(PixelStepper, { props: { active: 0 }, slots: { default: () => steps(2) } });
    expect(stepsOf(wrapper).map((step) => step.attributes('tabindex'))).toEqual([undefined, undefined]);
  });

  it('moves focus with the up and down arrows when vertical', async () => {
    const wrapper = mount(PixelStepper, {
      props: { active: 2, orientation: 'vertical', onStepClick: () => {} },
      slots: { default: () => steps(3) },
      attachTo: document.body,
    });
    const [first, second] = stepsOf(wrapper);
    (first!.element as HTMLElement).focus();
    await first!.trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(first!.element);
    await first!.trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(second!.element);
    await second!.trigger('keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(first!.element);
    wrapper.unmount();
  });

  it('shows the #icon slot until the step is completed or fails', async () => {
    const completed = ref(false);
    const wrapper = mount(() =>
      h(PixelStepper, { active: 0 }, () => [
        h(PixelStepperStep, { label: 'Custom', completed: completed.value }, { icon: () => h('i', '★') }),
      ]),
    );
    expect(wrapper.find('[data-pxl-step-icon="custom"]').text()).toBe('★');
    completed.value = true;
    await nextTick();
    expect(wrapper.find('[data-pxl-step-icon="custom"]').exists()).toBe(false);
    expect(wrapper.find('[data-pxl-step-icon="check"]').exists()).toBe(true);
  });

  it('places steps wrapped in a component of their own, which read their position', () => {
    const Wrapped = defineComponent({
      props: { label: { type: String, required: true } },
      setup: (props) => () => h(PixelStepperStep, { label: props.label }),
    });
    const wrapper = mount(PixelStepper, {
      props: { active: 1 },
      slots: { default: () => [h(Wrapped, { label: 'One' }), 'text is not a step', h(Wrapped, { label: 'Two' })] },
    });
    // Not clickable: the position and state are visually hidden text, not a name.
    expect(stepsOf(wrapper).map((step) => step.findAll('.sr-only').map((text) => text.element.textContent))).toEqual([
      ['Step 1 of 2: '],
      ['Step 2 of 2: ', ' (current)'],
    ]);
    expect(wrapper.findAll('hr')).toHaveLength(1);
  });

  it('passes attributes to the group', () => {
    const wrapper = mount(PixelStepper, {
      props: { active: 0 },
      attrs: { id: 'checkout', class: 'max-w-md' },
      slots: { default: () => steps(1) },
    });
    expect(wrapper.attributes('id')).toBe('checkout');
    expect(wrapper.attributes('role')).toBe('group');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['max-w-md', 'w-full']));
  });
});
