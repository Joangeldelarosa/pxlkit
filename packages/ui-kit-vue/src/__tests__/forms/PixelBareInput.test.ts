/**
 * PixelBareInput v-model, uncontrolled behaviour and attribute passthrough.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelBareInput } from '../../index';

describe('PixelBareInput', () => {
  it('updates a v-model binding and follows it', async () => {
    const value = ref('a');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelBareInput, { modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
    );
    const input = wrapper.find('input');
    expect(input.element.value).toBe('a');
    await input.setValue('retro');
    expect(value.value).toBe('retro');
    value.value = 'b';
    await wrapper.vm.$nextTick();
    expect(input.element.value).toBe('b');
  });

  it('starts from default-value and reports edits while uncontrolled', async () => {
    const wrapper = mount(PixelBareInput, { props: { defaultValue: 42 }, attrs: { type: 'number' } });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('42');
    await input.setValue('43');
    expect(wrapper.emitted('update:modelValue')).toEqual([['43']]);
    expect(input.element.value).toBe('43');
  });

  it('is the native input itself: attributes and listeners land on it', async () => {
    const onFocus = vi.fn();
    const onInput = vi.fn();
    const wrapper = mount(PixelBareInput, {
      attrs: { type: 'email', placeholder: 'you@pxlkit.xyz', 'aria-label': 'Email', class: 'mine', onFocus, onInput },
    });
    const input = wrapper.element as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('you@pxlkit.xyz');
    expect(input.getAttribute('aria-label')).toBe('Email');
    expect(input.className).toBe('mine');
    await wrapper.trigger('focus');
    await wrapper.find('input').setValue('a@b.c');
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onInput).toHaveBeenCalledOnce();
  });

  it('leaves a native default alone when it has no value', () => {
    const wrapper = mount(PixelBareInput, { attrs: { type: 'checkbox' } });
    expect((wrapper.element as HTMLInputElement).value).toBe('on');
  });
});
