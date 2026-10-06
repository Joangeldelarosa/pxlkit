/**
 * PixelSegmented v-model, one-way and uncontrolled behaviour, its group name
 * and form serialisation.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelSegmented } from '../../index';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];
const pressedOf = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('button').map((button) => button.attributes('aria-pressed'));

describe('PixelSegmented', () => {
  it('updates a v-model binding', async () => {
    const value = ref('day');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelSegmented, {
            label: 'Range',
            options: OPTIONS,
            modelValue: value.value,
            'onUpdate:modelValue': (v: string) => (value.value = v),
          }),
      }),
    );
    await wrapper.findAll('button')[2]!.trigger('click');
    expect(value.value).toBe('month');
    expect(pressedOf(wrapper)).toEqual(['false', 'false', 'true']);
  });

  it('stays as its parent says while controlled one-way, and keeps its own selection otherwise', async () => {
    const controlled = mount(PixelSegmented, { props: { options: OPTIONS, modelValue: 'week' } });
    await controlled.findAll('button')[0]!.trigger('click');
    expect(controlled.emitted('update:modelValue')).toEqual([['day']]);
    expect(pressedOf(controlled)).toEqual(['false', 'true', 'false']);
    const free = mount(PixelSegmented, { props: { options: OPTIONS } });
    expect(pressedOf(free)).toEqual(['false', 'false', 'false']);
    await free.findAll('button')[1]!.trigger('click');
    expect(pressedOf(free)).toEqual(['false', 'true', 'false']);
  });

  it('ignores clicks while disabled', async () => {
    const wrapper = mount(PixelSegmented, { props: { options: OPTIONS, modelValue: 'day', disabled: true } });
    await wrapper.findAll('button')[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.findAll('button').every((button) => (button.element as HTMLButtonElement).disabled)).toBe(true);
    expect(wrapper.classes()).toContain('opacity-50');
  });

  it('names its group by aria-label or label, and is no group without either', () => {
    const labelled = mount(PixelSegmented, { props: { options: OPTIONS, label: '', ariaLabel: 'Range' } });
    expect(labelled.find('p').exists()).toBe(false);
    expect(labelled.find('[role="group"]').attributes('aria-label')).toBe('Range');
    expect(labelled.attributes('aria-label')).toBeUndefined();
    const captioned = mount(PixelSegmented, { props: { options: OPTIONS, label: 'View' } });
    expect(captioned.find('[role="group"]').attributes('aria-label')).toBe('View');
    expect(mount(PixelSegmented, { props: { options: OPTIONS } }).find('[role="group"]').exists()).toBe(false);
  });

  it('submits the selected value when named', async () => {
    const wrapper = mount(PixelSegmented, { props: { options: OPTIONS, modelValue: 'week', name: 'range' } });
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect(hidden.name).toBe('range');
    expect(hidden.value).toBe('week');
  });
});
