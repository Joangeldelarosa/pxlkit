/**
 * PixelSelect v-model, uncontrolled behaviour, keyboard and pointer use,
 * form serialisation, option icons, attribute passthrough and the exposed
 * trigger.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelSelect } from '../../index';

enableAutoUnmount(afterEach);

const OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

describe('PixelSelect', () => {
  it('updates a v-model binding and follows it', async () => {
    const value = ref('red');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelSelect, { options: OPTIONS, modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
    );
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');
    await wrapper.findAll('[role="option"]')[1]!.trigger('click');
    expect(value.value).toBe('green');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    value.value = 'blue';
    await nextTick();
    expect(trigger.text()).toContain('Blue');
  });

  it('keeps its own value while uncontrolled and selects from the keyboard', async () => {
    const wrapper = mount(PixelSelect, { props: { options: OPTIONS, defaultValue: 'red' } });
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('keydown', { key: 'End' });
    const listbox = wrapper.find('[role="listbox"]');
    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(trigger.attributes('aria-controls')).toBe(listbox.attributes('id'));
    expect(trigger.attributes('aria-activedescendant')).toBe(wrapper.findAll('[role="option"]')[2]!.attributes('id'));
    await trigger.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toEqual([['blue']]);
    expect(trigger.text()).toContain('Blue');
    expect(trigger.attributes('aria-controls')).toBeUndefined();
  });

  it('closes on a press outside, and stays closed while disabled', async () => {
    const wrapper = mount(PixelSelect, { props: { options: OPTIONS }, attachTo: document.body });
    await wrapper.find('[role="combobox"]').trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await nextTick();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    const disabled = mount(PixelSelect, { props: { options: OPTIONS, disabled: true } });
    await disabled.find('[role="combobox"]').trigger('click');
    await disabled.find('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
    expect(disabled.find('[role="listbox"]').exists()).toBe(false);
  });

  it('submits the value through a hidden input when named and renders option icons', async () => {
    const wrapper = mount(PixelSelect, {
      props: { options: [{ value: 'red', label: 'Red', icon: () => h('b', '●') }, ...OPTIONS.slice(1)], name: 'color', defaultValue: 'red' },
    });
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect(hidden.name).toBe('color');
    expect(hidden.value).toBe('red');
    expect(wrapper.find('[role="combobox"] b').text()).toBe('●');
  });

  it('passes attributes to the trigger, labels it and exposes it', () => {
    const wrapper = mount(PixelSelect, {
      props: { options: OPTIONS, label: 'Color', id: 'color', error: 'Required', required: true },
      attrs: { 'aria-describedby': 'color-help', class: 'mine' },
    });
    const trigger = wrapper.find('[role="combobox"]');
    expect(wrapper.find('label').attributes('for')).toBe('color');
    expect(trigger.attributes('id')).toBe('color');
    // The error shows, so its message follows the ids passed in.
    expect(trigger.attributes('aria-describedby')).toBe('color-help color-msg');
    expect(trigger.attributes('aria-invalid')).toBe('true');
    expect(trigger.attributes('aria-required')).toBe('true');
    expect(trigger.classes()).toContain('mine');
    expect((wrapper.vm as unknown as { element: HTMLButtonElement }).element).toBe(trigger.element);
  });

  it('describes the trigger with the hint or the error, after the ids passed to it', async () => {
    const describedBy = ref<string | undefined>('color-note');
    const hint = ref<string | undefined>('Used for the badge');
    const error = ref<string | undefined>();
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelSelect, {
            options: OPTIONS,
            label: 'Color',
            id: 'color',
            hint: hint.value,
            error: error.value,
            'aria-describedby': describedBy.value,
          }),
      }),
      { attachTo: document.body },
    );
    const control = wrapper.find('[role="combobox"]');
    const message = () => document.getElementById('color-msg')?.textContent;
    expect(control.attributes('aria-describedby')).toBe('color-note color-msg');
    expect(message()).toBe('Used for the badge');
    error.value = 'Required';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('color-note color-msg');
    expect(message()).toBe('Required');
    hint.value = undefined;
    error.value = undefined;
    describedBy.value = 'color-policy';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('color-policy');
    expect(message()).toBeUndefined();
    describedBy.value = undefined;
    await nextTick();
    expect(control.attributes()).not.toHaveProperty('aria-describedby');
  });
});
