/**
 * PixelCombobox v-model, the uncontrolled combobox, the closed trigger's
 * keys, filtering, disabled state, form serialisation, attribute passthrough
 * and the exposed trigger. Rendering and the shared interactions are covered
 * against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelCombobox } from '../../index';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];
const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};
const options = () => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
const key = (element: Element, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

// The open popover keeps page-wide listeners until it unmounts.
enableAutoUnmount(afterEach);

describe('PixelCombobox', () => {
  it('updates a v-model binding and follows it', async () => {
    const value = ref('apple');
    const wrapper = mount(
      defineComponent({
        render: () => h(PixelCombobox, { options: OPTIONS, modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
      { attachTo: document.body },
    );
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');
    await settle();
    options()[1]!.click();
    await settle();
    expect(value.value).toBe('banana');
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    value.value = 'apple';
    await nextTick();
    expect(trigger.text()).toContain('Apple');
  });

  it('opens with Enter, filters in its focused search field and selects with Enter, leaving disabled options alone', async () => {
    const wrapper = mount(PixelCombobox, { props: { options: OPTIONS, defaultValue: 'apple' }, attachTo: document.body });
    const trigger = wrapper.find('[role="combobox"]');
    key(trigger.element, 'Enter');
    await settle();
    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    const search = document.querySelector<HTMLInputElement>('[role="searchbox"]')!;
    expect(document.activeElement).toBe(search);
    search.value = 'rr';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(options().map((option) => option.textContent)).toEqual(['Cherry']);
    expect(search.getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
    key(search, 'Enter');
    await settle();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    search.value = 'an';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    key(search, 'Enter');
    await settle();
    expect(wrapper.emitted('update:modelValue')).toEqual([['banana']]);
    expect(trigger.text()).toContain('Banana');
  });

  it('stays closed while disabled, and submits its value by name', async () => {
    const wrapper = mount(PixelCombobox, {
      props: { options: OPTIONS, defaultValue: 'banana', name: 'fruit', disabled: true },
      attachTo: document.body,
    });
    const trigger = wrapper.find('[role="combobox"]');
    expect(trigger.attributes('disabled')).toBeDefined();
    expect(trigger.attributes('aria-disabled')).toBe('true');
    key(trigger.element, 'ArrowDown');
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect([hidden.name, hidden.value]).toEqual(['fruit', 'banana']);
  });

  it('passes attributes to the trigger, labels and describes it and exposes it', () => {
    const wrapper = mount(PixelCombobox, {
      props: { options: OPTIONS, label: 'Fruit', id: 'fruit', error: 'Required' },
      attrs: { 'aria-describedby': 'fruit-help', class: 'mine' },
    });
    const trigger = wrapper.find('[role="combobox"]');
    expect(wrapper.find('label').attributes('for')).toBe('fruit');
    expect(trigger.attributes('id')).toBe('fruit');
    expect(trigger.attributes('aria-describedby')).toBe('fruit-help fruit-msg');
    expect(trigger.attributes('aria-invalid')).toBe('true');
    expect(trigger.classes()).toContain('mine');
    expect((wrapper.vm as unknown as { element: HTMLButtonElement }).element).toBe(trigger.element);
  });
});
