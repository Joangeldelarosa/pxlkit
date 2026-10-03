/**
 * PixelMultiSelect v-model, the uncontrolled multi-select, its cap, chip and
 * keyboard removal, clearing, option icons, form serialisation, attribute
 * passthrough and the exposed trigger. Rendering and the shared interactions
 * are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelMultiSelect } from '../../index';

const OPTIONS = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
];
const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};
const option = (label: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((element) => element.textContent?.includes(label))!;
const key = (element: Element, name: string) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

// The open popover keeps page-wide listeners until it unmounts.
enableAutoUnmount(afterEach);

describe('PixelMultiSelect', () => {
  it('updates a v-model binding with each toggle and follows it', async () => {
    const value = ref(['a']);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelMultiSelect, { options: OPTIONS, modelValue: value.value, 'onUpdate:modelValue': (v: string[]) => (value.value = v) }),
      }),
      { attachTo: document.body },
    );
    await wrapper.find('[role="combobox"]').trigger('click');
    await settle();
    option('Cherry').click();
    await settle();
    expect(value.value).toEqual(['a', 'c']);
    option('Apple').click();
    await settle();
    expect(value.value).toEqual(['c']);
    value.value = ['b', 'a'];
    await nextTick();
    expect(wrapper.findAll('[data-pxl-chip-remove]').map((chip) => chip.attributes('data-pxl-chip-remove'))).toEqual(['b', 'a']);
  });

  it('keeps its own values while uncontrolled: capped, removed by chip, Backspace and Clear', async () => {
    const wrapper = mount(PixelMultiSelect, {
      props: { options: OPTIONS, defaultValue: ['a', 'b'], max: 2, clearable: true, name: 'fruits' },
      attachTo: document.body,
    });
    const submitted = () => wrapper.findAll('input[type="hidden"]').map((input) => (input.element as HTMLInputElement).value);
    expect(submitted()).toEqual(['a', 'b']);
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');
    await settle();
    expect(option('Cherry').getAttribute('aria-disabled')).toBe('true');
    option('Cherry').click();
    await settle();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(document.querySelector('[role="listbox"]')!.nextElementSibling!.textContent).toBe('2/2 selected');
    await wrapper.find('[data-pxl-chip-remove="a"]').trigger('click');
    expect(submitted()).toEqual(['b']);
    key(trigger.element, 'Backspace');
    await nextTick();
    expect(submitted()).toEqual([]);
    option('Cherry').click();
    await settle();
    await wrapper.find('[aria-label="Clear selection"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b']], [[]], [['c']], [[]]]);
  });

  it('renders option icons on the options and the chips', async () => {
    const wrapper = mount(PixelMultiSelect, {
      props: { options: [{ value: 'a', label: 'Apple', icon: () => h('b', '●') }], defaultValue: ['a'] },
      attachTo: document.body,
    });
    expect(wrapper.find('[role="combobox"] b').text()).toBe('●');
    await wrapper.find('[role="combobox"]').trigger('click');
    await settle();
    expect(option('Apple').querySelector('b')?.textContent).toBe('●');
  });

  it('passes attributes to the trigger, labels and describes it and exposes it', () => {
    const wrapper = mount(PixelMultiSelect, {
      props: { options: OPTIONS, label: 'Fruits', id: 'fruits', hint: 'Pick a few' },
      attrs: { 'aria-describedby': 'fruits-help', class: 'mine' },
    });
    const trigger = wrapper.find('[role="combobox"]');
    expect(wrapper.find('label').attributes('for')).toBe('fruits');
    expect(trigger.attributes('aria-describedby')).toBe('fruits-help fruits-msg');
    expect(trigger.classes()).toContain('mine');
    expect((wrapper.vm as unknown as { element: HTMLButtonElement }).element).toBe(trigger.element);
  });
});
