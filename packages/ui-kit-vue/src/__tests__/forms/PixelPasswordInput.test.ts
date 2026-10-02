/**
 * PixelPasswordInput v-model, uncontrolled behaviour, the visibility toggle,
 * attribute passthrough and the exposed input.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelPasswordInput } from '../../index';

describe('PixelPasswordInput', () => {
  it('updates a v-model binding and follows it', async () => {
    const value = ref('');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelPasswordInput, { modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
    );
    const input = wrapper.find('input');
    await input.setValue('hunter2');
    expect(value.value).toBe('hunter2');
    value.value = 'reset';
    await nextTick();
    expect(input.element.value).toBe('reset');
  });

  it('starts from default-value and reports edits while uncontrolled', async () => {
    const wrapper = mount(PixelPasswordInput, { props: { defaultValue: 's3cret' } });
    const input = wrapper.find('input');
    expect(input.element.value).toBe('s3cret');
    await input.setValue('s3cret!');
    expect(wrapper.emitted('update:modelValue')).toEqual([['s3cret!']]);
  });

  it('toggles visibility with custom labels, and not while disabled', async () => {
    const wrapper = mount(PixelPasswordInput, { props: { toggleLabels: ['Ver', 'Ocultar'] } });
    const toggle = wrapper.find('button');
    expect(wrapper.find('input').attributes('type')).toBe('password');
    expect(toggle.attributes('aria-pressed')).toBe('false');
    await toggle.trigger('click');
    expect(wrapper.find('input').attributes('type')).toBe('text');
    expect(toggle.attributes('aria-label')).toBe('Ocultar');
    expect(toggle.attributes('aria-pressed')).toBe('true');
    expect(toggle.attributes('tabindex')).toBe('-1');

    const disabled = mount(PixelPasswordInput, { props: { disabled: true } });
    await disabled.find('button').trigger('click');
    expect(disabled.find('input').attributes('type')).toBe('password');
    expect(disabled.find('input').element.disabled).toBe(true);
    expect(disabled.find('button').element.disabled).toBe(true);
  });

  it('passes attributes to the input, labels it and exposes it', () => {
    const wrapper = mount(PixelPasswordInput, {
      props: { label: 'Password', id: 'pw', error: 'Too short' },
      attrs: { autocomplete: 'new-password', name: 'pw', class: 'mine' },
    });
    const input = wrapper.find('input');
    expect(wrapper.find('label').attributes('for')).toBe('pw');
    expect(input.attributes('autocomplete')).toBe('new-password');
    expect(input.attributes('name')).toBe('pw');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(input.classes()).toContain('mine');
    expect((wrapper.vm as unknown as { element: HTMLInputElement }).element).toBe(input.element);
  });

  it('describes the input with the hint or the error, after the ids passed to it', async () => {
    const describedBy = ref<string | undefined>('pw-rules');
    const hint = ref<string | undefined>('At least 12 characters');
    const error = ref<string | undefined>();
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelPasswordInput, {
            label: 'Password', id: 'pw',
            hint: hint.value,
            error: error.value,
            'aria-describedby': describedBy.value,
          }),
      }),
      { attachTo: document.body },
    );
    const control = wrapper.find('input');
    const message = () => document.getElementById('pw-msg')?.textContent;
    expect(control.attributes('aria-describedby')).toBe('pw-rules pw-msg');
    expect(message()).toBe('At least 12 characters');
    error.value = 'Too short';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('pw-rules pw-msg');
    expect(message()).toBe('Too short');
    hint.value = undefined;
    error.value = undefined;
    describedBy.value = 'pw-policy';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('pw-policy');
    expect(message()).toBeUndefined();
    describedBy.value = undefined;
    await nextTick();
    expect(control.attributes()).not.toHaveProperty('aria-describedby');
    wrapper.unmount();
  });
});
