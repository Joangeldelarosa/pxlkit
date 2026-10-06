/**
 * PixelBareTextarea v-model, uncontrolled behaviour and attribute passthrough.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelBareTextarea } from '../../index';

describe('PixelBareTextarea', () => {
  it('updates a v-model binding and follows it', async () => {
    const value = ref('');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelBareTextarea, { modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
    );
    const textarea = wrapper.find('textarea');
    await textarea.setValue('pixel art');
    expect(value.value).toBe('pixel art');
    value.value = 'reset';
    await wrapper.vm.$nextTick();
    expect(textarea.element.value).toBe('reset');
  });

  it('starts from default-value and reports edits while uncontrolled', async () => {
    const wrapper = mount(PixelBareTextarea, { props: { defaultValue: 'draft' } });
    const textarea = wrapper.find('textarea');
    expect(textarea.element.value).toBe('draft');
    await textarea.setValue('final');
    expect(wrapper.emitted('update:modelValue')).toEqual([['final']]);
    expect(textarea.element.value).toBe('final');
  });

  it('is the native textarea itself: attributes and listeners land on it', async () => {
    const onBlur = vi.fn();
    const wrapper = mount(PixelBareTextarea, { attrs: { rows: 6, placeholder: 'Notes...', maxlength: 10, onBlur } });
    const textarea = wrapper.element as HTMLTextAreaElement;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.rows).toBe(6);
    expect(textarea.placeholder).toBe('Notes...');
    expect(textarea.maxLength).toBe(10);
    await wrapper.trigger('blur');
    expect(onBlur).toHaveBeenCalledOnce();
  });
});
