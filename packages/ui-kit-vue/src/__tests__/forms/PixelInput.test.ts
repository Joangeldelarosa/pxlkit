/**
 * PixelInput v-model, uncontrolled behaviour, clearing, slots, attribute
 * passthrough and the exposed input.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelInput } from '../../index';

describe('PixelInput', () => {
  it('updates a v-model binding and follows it', async () => {
    const value = ref('a');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelInput, { label: 'Name', modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
    );
    const input = wrapper.find('input');
    await input.setValue('retro');
    expect(value.value).toBe('retro');
    value.value = 'reset';
    await nextTick();
    expect(input.element.value).toBe('reset');
  });

  it('starts from default-value and reports edits while uncontrolled', async () => {
    const wrapper = mount(PixelInput, { props: { defaultValue: 'Pixel Hero', showCount: true } });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('Pixel Hero');
    await input.setValue('Hero');
    expect(wrapper.emitted('update:modelValue')).toEqual([['Hero']]);
    expect(wrapper.text()).toContain('4');
  });

  it('clears an uncontrolled field and reports it', async () => {
    const wrapper = mount(PixelInput, { props: { defaultValue: 'abc', clearable: true } });
    await wrapper.find('[aria-label="Clear input"]').trigger('click');
    expect(wrapper.find('input').element.value).toBe('');
    expect(wrapper.emitted('clear')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')).toEqual([['']]);
    expect(wrapper.find('[aria-label="Clear input"]').exists()).toBe(false);
  });

  it('clears a v-model binding', async () => {
    const value = ref('clear me');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelInput, { clearable: true, modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
    );
    await wrapper.find('[aria-label="Clear input"]').trigger('click');
    expect(value.value).toBe('');
  });

  it('hides the clear button while disabled or loading, and loading disables the input', () => {
    const disabled = mount(PixelInput, { props: { defaultValue: 'abc', clearable: true, disabled: true } });
    expect(disabled.find('[aria-label="Clear input"]').exists()).toBe(false);
    const loading = mount(PixelInput, { props: { defaultValue: 'abc', clearable: true, loading: true } });
    expect(loading.find('[aria-label="Clear input"]').exists()).toBe(false);
    expect(loading.find('input').element.disabled).toBe(true);
    expect(loading.find('.animate-spin').exists()).toBe(true);
  });

  it('renders the prefix, suffix and addon slots, and the legacy icon slot', () => {
    const wrapper = mount(PixelInput, {
      slots: {
        prefix: () => h('b', '$'),
        suffix: () => h('i', 'USD'),
        'addon-left': () => 'https://',
        'addon-right': () => '.xyz',
      },
    });
    const input = wrapper.find('input');
    expect(wrapper.find('b').text()).toBe('$');
    expect(wrapper.find('i').text()).toBe('USD');
    expect(wrapper.text()).toContain('https://');
    expect(input.classes()).toEqual(expect.arrayContaining(['pl-10', 'pr-10', 'rounded-l-none', 'rounded-r-none']));
    const icon = mount(PixelInput, { slots: { icon: () => h('em', '?') } });
    expect(icon.find('em').exists()).toBe(true);
    expect(icon.find('input').classes()).toContain('pl-10');
  });

  it('pads for slots that come and go', async () => {
    const withPrefix = ref(true);
    const wrapper = mount(
      defineComponent({
        render: () => h(PixelInput, null, withPrefix.value ? { prefix: () => '$' } : {}),
      }),
    );
    expect(wrapper.find('input').classes()).toContain('pl-10');
    withPrefix.value = false;
    await nextTick();
    expect(wrapper.find('input').classes()).toContain('pl-3');
  });

  it('passes attributes and listeners to the input and labels it', async () => {
    const onFocus = vi.fn();
    const wrapper = mount(PixelInput, {
      props: { label: 'Email', id: 'email', hint: 'We never share it', showCount: { max: 5 } },
      attrs: { type: 'email', placeholder: 'you@pxlkit.xyz', class: 'mine', onFocus },
    });
    const input = wrapper.find('input');
    expect(wrapper.find('label').attributes('for')).toBe('email');
    expect(input.attributes('id')).toBe('email');
    expect(input.attributes('type')).toBe('email');
    expect(input.attributes('placeholder')).toBe('you@pxlkit.xyz');
    expect(input.attributes('maxlength')).toBe('5');
    expect(input.attributes('aria-describedby')).toBe('email-msg');
    expect(input.classes()).toContain('mine');
    await input.trigger('focus');
    expect(onFocus).toHaveBeenCalledOnce();
    expect(wrapper.find('div').classes()).not.toContain('mine');
  });

  it('exposes the native input', () => {
    const wrapper = mount(PixelInput);
    expect((wrapper.vm as unknown as { element: HTMLInputElement }).element).toBe(wrapper.find('input').element);
  });

  it('describes the input with the hint or the error, after the ids passed to it', async () => {
    const describedBy = ref<string | undefined>('email-rules');
    const hint = ref<string | undefined>('We never share it');
    const error = ref<string | undefined>();
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelInput, {
            label: 'Email', id: 'email',
            hint: hint.value,
            error: error.value,
            'aria-describedby': describedBy.value,
          }),
      }),
      { attachTo: document.body },
    );
    const control = wrapper.find('input');
    const message = () => document.getElementById('email-msg')?.textContent;
    expect(control.attributes('aria-describedby')).toBe('email-rules email-msg');
    expect(message()).toBe('We never share it');
    error.value = 'Enter a valid email';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('email-rules email-msg');
    expect(message()).toBe('Enter a valid email');
    hint.value = undefined;
    error.value = undefined;
    describedBy.value = 'email-policy';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('email-policy');
    expect(message()).toBeUndefined();
    describedBy.value = undefined;
    await nextTick();
    expect(control.attributes()).not.toHaveProperty('aria-describedby');
    wrapper.unmount();
  });
});
