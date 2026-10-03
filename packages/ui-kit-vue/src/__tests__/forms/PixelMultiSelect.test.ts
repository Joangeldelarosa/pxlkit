/**
 * PixelMultiSelect v-model, the uncontrolled multi-select, its cap, chip and
 * keyboard removal, clearing, the field's controls and where focus goes,
 * option icons, form serialisation, attribute passthrough (`disabled`
 * included) and the exposed trigger. Rendering and the shared interactions
 * are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { getFocusableElements } from '@pxlkit/ui-kit-core';
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
const button = (name: string) => document.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
// The field holds the chips and the combobox, then the clear button.
const fieldOf = (combobox: Element) => combobox.parentElement!.parentElement!;
// Enter on a focused button, which the browser follows with a click.
const pressEnter = (element: HTMLElement) => {
  element.focus();
  key(element, 'Enter');
  element.click();
};

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
    expect(wrapper.find('[data-pxl-chip-remove="a"]').element.parentElement!.querySelector('b')!.textContent).toBe('●');
    expect(wrapper.find('[role="combobox"] b').exists()).toBe(false);
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

  it("holds each chip's remove button, the combobox and the clear button side by side, in that tab order", () => {
    const wrapper = mount(PixelMultiSelect, {
      props: { options: OPTIONS, defaultValue: ['a', 'b'], clearable: true },
      attachTo: document.body,
    });
    const combobox = wrapper.find('[role="combobox"]').element as HTMLElement;
    const controls = [button('Remove Apple'), button('Remove Banana'), combobox, button('Clear selection')];
    expect(getFocusableElements(fieldOf(combobox))).toEqual(controls);
    for (const control of controls) expect(control.getAttribute('type')).toBe('button');
    expect(combobox.querySelector('button, [role="button"], [tabindex]')).toBeNull();
    expect(combobox.textContent).toBe('Apple, Banana');
    expect(fieldOf(combobox).hasAttribute('aria-expanded')).toBe(false);
  });

  it('renders on the server with no control inside another', async () => {
    const html = await renderToString(
      createSSRApp(() => h(PixelMultiSelect, { options: OPTIONS, defaultValue: ['a', 'b'], clearable: true, label: 'Fruits' })),
    );
    const page = new DOMParser().parseFromString(html, 'text/html');
    const combobox = page.querySelector('[role="combobox"]')!;
    expect(combobox.querySelector('button, [role="button"], [tabindex]')).toBeNull();
    expect(page.querySelectorAll('button button, button [role="button"]')).toHaveLength(0);
    expect(page.querySelectorAll('button[data-pxl-chip-remove]')).toHaveLength(2);
    expect(page.querySelector('label')!.getAttribute('for')).toBe(combobox.id);
  });

  it("removes chips from the keyboard, focus moving to the next chip's button, then to the combobox", async () => {
    const wrapper = mount(PixelMultiSelect, { props: { options: OPTIONS, defaultValue: ['a', 'b'] }, attachTo: document.body });
    pressEnter(button('Remove Apple'));
    await nextTick();
    expect(document.activeElement).toBe(button('Remove Banana'));
    pressEnter(button('Remove Banana'));
    await nextTick();
    expect(document.activeElement).toBe(wrapper.find('[role="combobox"]').element);
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b']], [[]]]);
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('removes a chip and clears under the pointer, leaving focus and the open listbox as they are', async () => {
    const wrapper = mount(PixelMultiSelect, {
      props: { options: OPTIONS, defaultValue: ['a', 'b'], clearable: true, searchable: true },
      attachTo: document.body,
    });
    await wrapper.find('[role="combobox"]').trigger('click');
    await settle();
    const search = document.querySelector<HTMLInputElement>('[role="searchbox"]')!;
    expect(document.activeElement).toBe(search);
    for (const name of ['Remove Banana', 'Clear selection']) {
      const target = button(name);
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      expect(target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))).toBe(false);
      target.click();
      await settle();
      expect(document.activeElement).toBe(search);
      expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    }
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a']], [[]]]);
  });

  it('clears from the keyboard, handing focus to the combobox', async () => {
    const wrapper = mount(PixelMultiSelect, {
      props: { options: OPTIONS, defaultValue: ['a'], clearable: true },
      attachTo: document.body,
    });
    pressEnter(button('Clear selection'));
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([[[]]]);
    expect(document.activeElement).toBe(wrapper.find('[role="combobox"]').element);
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('opens and closes the listbox from a press anywhere on the field, focusing the combobox', async () => {
    const wrapper = mount(PixelMultiSelect, { props: { options: OPTIONS, defaultValue: ['a'] }, attachTo: document.body });
    const combobox = wrapper.find('[role="combobox"]');
    fieldOf(combobox.element).click();
    await settle();
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    expect(document.activeElement).toBe(combobox.element);
    expect(combobox.attributes('aria-expanded')).toBe('true');
    // A press on the field, a chip's label here, is not one outside the popover.
    const chipLabel = button('Remove Apple').previousElementSibling as HTMLElement;
    chipLabel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    chipLabel.click();
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('hands focus back to the combobox when Escape closes the listbox from the search field', async () => {
    const wrapper = mount(PixelMultiSelect, { props: { options: OPTIONS, searchable: true }, attachTo: document.body });
    await wrapper.find('[role="combobox"]').trigger('click');
    await settle();
    key(document.querySelector('[role="searchbox"]')!, 'Escape');
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(wrapper.find('[role="combobox"]').element);
  });

  it('disables the whole field with a disabled attribute', async () => {
    const wrapper = mount(PixelMultiSelect, {
      props: { options: OPTIONS, defaultValue: ['a'], clearable: true },
      attrs: { disabled: '' },
      attachTo: document.body,
    });
    const combobox = wrapper.find('[role="combobox"]').element as HTMLButtonElement;
    expect([combobox, button('Remove Apple'), button('Clear selection')].map((control) => control.disabled)).toEqual([true, true, true]);
    fieldOf(combobox).click();
    await settle();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).not.toBe(combobox);
  });
});
