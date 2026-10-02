/**
 * PixelRadioGroup v-model, one-way and uncontrolled behaviour, and form
 * serialisation.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelRadioGroup } from '../../index';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];
const checkedOf = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('[role="radio"]').map((radio) => radio.attributes('aria-checked'));

describe('PixelRadioGroup', () => {
  it('updates a v-model binding', async () => {
    const value = ref('a');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelRadioGroup, {
            label: 'Pick',
            options: OPTIONS,
            modelValue: value.value,
            'onUpdate:modelValue': (v: string) => (value.value = v),
          }),
      }),
    );
    await wrapper.findAll('[role="radio"]')[2]!.trigger('click');
    expect(value.value).toBe('c');
    expect(checkedOf(wrapper)).toEqual(['false', 'false', 'true']);
  });

  it('stays as its parent says while controlled one-way', async () => {
    const wrapper = mount(PixelRadioGroup, { props: { label: 'Pick', options: OPTIONS, modelValue: 'b' } });
    await wrapper.findAll('[role="radio"]')[0]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['a']]);
    expect(checkedOf(wrapper)).toEqual(['false', 'true', 'false']);
  });

  it('keeps its own selection while uncontrolled, starting with none, and none while disabled', async () => {
    const wrapper = mount(PixelRadioGroup, { props: { label: 'Pick', options: OPTIONS } });
    expect(checkedOf(wrapper)).toEqual(['false', 'false', 'false']);
    await wrapper.findAll('[role="radio"]')[1]!.trigger('click');
    expect(checkedOf(wrapper)).toEqual(['false', 'true', 'false']);
    const disabled = mount(PixelRadioGroup, { props: { label: 'Pick', options: OPTIONS, disabled: true } });
    await disabled.findAll('[role="radio"]')[1]!.trigger('click');
    expect(disabled.emitted('update:modelValue')).toBeUndefined();
    expect(disabled.attributes('aria-disabled')).toBe('true');
  });

  it('is a radiogroup fieldset named by its legend, submitting the value when named', () => {
    const wrapper = mount(PixelRadioGroup, {
      props: { label: 'Plan', options: OPTIONS, modelValue: 'b', name: 'plan', required: true },
    });
    expect(wrapper.element.tagName).toBe('FIELDSET');
    expect(wrapper.attributes('role')).toBe('radiogroup');
    expect(wrapper.attributes('aria-required')).toBe('true');
    expect(wrapper.find('legend').text()).toBe('Plan');
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect(hidden.name).toBe('plan');
    expect(hidden.value).toBe('b');
  });
});
