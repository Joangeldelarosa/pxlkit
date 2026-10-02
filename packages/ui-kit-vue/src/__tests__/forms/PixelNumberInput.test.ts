/**
 * PixelNumberInput v-model, uncontrolled behaviour, steps, typing and
 * clamping, form serialisation, attribute passthrough and the exposed input.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelNumberInput } from '../../index';

const spinbutton = '[role="spinbutton"]';

describe('PixelNumberInput', () => {
  it('updates a v-model binding from the steppers and typing, and follows it', async () => {
    const value = ref(5);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelNumberInput, {
            min: 0,
            max: 100,
            modelValue: value.value,
            'onUpdate:modelValue': (v: number) => (value.value = v),
          }),
      }),
    );
    await wrapper.find('[aria-label="Increment"]').trigger('click');
    expect(value.value).toBe(6);
    await wrapper.find(spinbutton).setValue('42');
    expect(value.value).toBe(42);
    value.value = 7;
    await nextTick();
    expect((wrapper.find(spinbutton).element as HTMLInputElement).value).toBe('7');
    expect(wrapper.find(spinbutton).attributes('aria-valuenow')).toBe('7');
  });

  it('steps from the keyboard and shows each step while focused', async () => {
    const wrapper = mount(PixelNumberInput, { props: { defaultValue: 999.5, step: 0.25, precision: 2, thousandsSeparator: ',' } });
    const input = wrapper.find(spinbutton);
    await input.trigger('focus');
    await input.trigger('keydown', { key: 'ArrowUp' });
    await input.trigger('keydown', { key: 'ArrowUp' });
    expect((input.element as HTMLInputElement).value).toBe('1,000.00');
    expect(wrapper.emitted('update:modelValue')).toEqual([[999.75], [1000]]);
  });

  it('keeps partial input while focused and settles on blur', async () => {
    const wrapper = mount(PixelNumberInput, { props: { defaultValue: 5, min: 0, max: 10 } });
    const input = wrapper.find(spinbutton);
    const field = input.element as HTMLInputElement;
    await input.trigger('focus');
    await input.setValue('-');
    expect(field.value).toBe('-');
    await input.trigger('blur');
    expect(field.value).toBe('5');
    await input.trigger('focus');
    await input.setValue('15');
    await input.trigger('blur');
    expect(field.value).toBe('10');
    expect(wrapper.emitted('update:modelValue')).toEqual([[15], [10]]);
  });

  it('clamps while typing when strict and drops minus signs when negatives are not allowed', async () => {
    const strict = mount(PixelNumberInput, { props: { defaultValue: 2, min: 0, max: 5, clampBehavior: 'strict' } });
    await strict.find(spinbutton).setValue('9');
    expect((strict.find(spinbutton).element as HTMLInputElement).value).toBe('5');
    expect(strict.emitted('update:modelValue')).toEqual([[5]]);
    const positive = mount(PixelNumberInput, { props: { defaultValue: 0, allowNegative: false } });
    await positive.find(spinbutton).setValue('-42');
    expect(positive.emitted('update:modelValue')).toEqual([[42]]);
  });

  it('ignores steps while disabled or at a bound', async () => {
    const disabled = mount(PixelNumberInput, { props: { defaultValue: 1, disabled: true } });
    const input = disabled.find(spinbutton);
    await input.trigger('keydown', { key: 'ArrowUp' });
    await disabled.find('[aria-label="Increment"]').trigger('click');
    expect(disabled.emitted('update:modelValue')).toBeUndefined();
    expect((disabled.find('[aria-label="Decrement"]').element as HTMLButtonElement).disabled).toBe(true);

    const atMax = mount(PixelNumberInput, { props: { defaultValue: 150, min: 0, max: 100 } });
    const increment = atMax.find('[aria-label="Increment"]');
    expect((increment.element as HTMLButtonElement).disabled).toBe(true);
    await increment.trigger('click');
    expect(atMax.emitted('update:modelValue')).toBeUndefined();
  });

  it('submits the number through a hidden input when named', async () => {
    const wrapper = mount(PixelNumberInput, { props: { name: 'qty', defaultValue: 3 } });
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect(hidden.name).toBe('qty');
    expect(hidden.value).toBe('3');
    await wrapper.find('[aria-label="Increment"]').trigger('click');
    expect(hidden.value).toBe('4');
    expect(mount(PixelNumberInput, { props: { name: 'qty' } }).find('input[type="hidden"]').element).toHaveProperty('value', '');
  });

  it('passes attributes and listeners to the input, labels it and exposes it', async () => {
    const keys: string[] = [];
    const wrapper = mount(PixelNumberInput, {
      props: { label: 'Qty', id: 'qty', min: 1, max: 9, defaultValue: 2 },
      attrs: { 'aria-describedby': 'qty-help', class: 'mine', onKeydown: (event: KeyboardEvent) => keys.push(event.key) },
    });
    const input = wrapper.find(spinbutton);
    expect(wrapper.find('label').attributes('for')).toBe('qty');
    expect(input.attributes('aria-valuemin')).toBe('1');
    expect(input.attributes('aria-valuemax')).toBe('9');
    expect(input.attributes('aria-describedby')).toBe('qty-help');
    expect(input.classes()).toContain('mine');
    await input.trigger('keydown', { key: 'ArrowUp' });
    expect(keys).toEqual(['ArrowUp']);
    expect((wrapper.vm as unknown as { element: HTMLInputElement }).element).toBe(input.element);
  });
});
