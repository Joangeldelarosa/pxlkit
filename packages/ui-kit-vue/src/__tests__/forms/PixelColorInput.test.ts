/**
 * PixelColorInput v-model, the uncontrolled input, formats, the hex draft,
 * form serialisation, attribute passthrough, the exposed trigger and focus
 * moving into the dialog. Rendering and the shared interactions are covered
 * against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelColorInput } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};
const hexField = () => document.querySelector<HTMLInputElement>('[aria-label="Hex value"]')!;
const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

// The open popover keeps page-wide listeners until it unmounts.
enableAutoUnmount(afterEach);

describe('PixelColorInput', () => {
  it('updates a v-model binding from the presets and a complete hex, in its format, and follows it', async () => {
    const value = ref('#06b6d4');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelColorInput, { modelValue: value.value, format: 'rgb', 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
      { attachTo: document.body },
    );
    await wrapper.find('button').trigger('click');
    await settle();
    expect(document.activeElement).toBe(document.querySelector('[aria-label="Native color picker"]'));
    document.querySelector<HTMLButtonElement>('[aria-label="#ef4444"]')!.click();
    await settle();
    expect(value.value).toBe('rgb(239, 68, 68)');
    type(hexField(), '#12');
    await settle();
    expect(value.value).toBe('rgb(239, 68, 68)');
    expect(hexField().value).toBe('#12');
    type(hexField(), '123456');
    await settle();
    expect(value.value).toBe('rgb(18, 52, 86)');
    value.value = '#ffffff';
    await settle();
    expect(hexField().value).toBe('#ffffff');
    expect(document.querySelector('[aria-label="#ffffff"]')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps its own value while uncontrolled, discards a partial hex on blur and submits by name', async () => {
    const wrapper = mount(PixelColorInput, { props: { defaultValue: '#112233', name: 'brand', format: 'hsl' }, attachTo: document.body });
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect([hidden.name, hidden.value]).toEqual(['brand', '#112233']);
    await wrapper.find('button').trigger('click');
    await settle();
    type(hexField(), 'f00');
    await settle();
    expect(wrapper.emitted('update:modelValue')).toEqual([['hsl(0, 100%, 50%)']]);
    type(hexField(), '#abcd');
    hexField().dispatchEvent(new FocusEvent('blur'));
    await settle();
    expect(hexField().value).toBe('hsl(0, 100%, 50%)');
    expect(hidden.value).toBe('hsl(0, 100%, 50%)');
  });

  it('passes attributes to the trigger, names it after the label and exposes it', () => {
    const wrapper = mount(PixelColorInput, {
      props: { label: 'Accent', id: 'accent', hint: 'Used for links' },
      attrs: { 'aria-describedby': 'accent-help', class: 'mine' },
    });
    const trigger = wrapper.find('button');
    expect(trigger.attributes('aria-label')).toBe('Accent');
    expect(trigger.attributes('aria-describedby')).toBe('accent-help accent-msg');
    expect(trigger.classes()).toContain('mine');
    expect(trigger.text()).toBe('Pick a color');
    expect((wrapper.vm as unknown as { element: HTMLButtonElement }).element).toBe(trigger.element);
  });
});
