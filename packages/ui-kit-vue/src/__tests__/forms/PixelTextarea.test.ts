/**
 * PixelTextarea v-model, uncontrolled behaviour, auto-grow, the counter,
 * attribute passthrough and the exposed textarea.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelTextarea } from '../../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelTextarea', () => {
  it('updates a v-model binding and follows it', async () => {
    const value = ref('');
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelTextarea, { modelValue: value.value, 'onUpdate:modelValue': (v: string) => (value.value = v) }),
      }),
    );
    const textarea = wrapper.find('textarea');
    await textarea.setValue('pixel art');
    expect(value.value).toBe('pixel art');
    value.value = 'reset';
    await nextTick();
    expect(textarea.element.value).toBe('reset');
  });

  it('starts from default-value, counts and reports edits while uncontrolled', async () => {
    const wrapper = mount(PixelTextarea, { props: { defaultValue: 'hello', showCount: { max: 6 } } });
    const textarea = wrapper.find('textarea');
    expect(textarea.element.value).toBe('hello');
    expect(textarea.attributes('maxlength')).toBe('6');
    expect(wrapper.text()).toContain('5/6');
    await textarea.setValue('hello world');
    expect(wrapper.emitted('update:modelValue')).toEqual([['hello world']]);
    expect(wrapper.text()).toContain('11/6');
    expect(wrapper.find('[aria-live="polite"]').classes()).toContain('text-retro-red');
  });

  it('grows with its content once mounted and as the value changes', async () => {
    const content = { height: 120 };
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => content.height,
    });
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      lineHeight: '20px',
      paddingTop: '0px',
      paddingBottom: '0px',
    } as CSSStyleDeclaration);
    try {
      const wrapper = mount(PixelTextarea, { props: { autosize: true, minRows: 2, maxRows: 4, defaultValue: 'a' } });
      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('rows')).toBe('2');
      expect(textarea.element.style.height).toBe('80px');
      expect(textarea.element.style.overflowY).toBe('auto');
      content.height = 50;
      await textarea.setValue('b');
      expect(textarea.element.style.height).toBe('50px');
      expect(textarea.element.style.overflowY).toBe('hidden');
    } finally {
      delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
    }
  });

  it('passes attributes to the textarea, labels it and exposes it', () => {
    const wrapper = mount(PixelTextarea, {
      props: { label: 'Notes', id: 'notes', error: 'Required' },
      attrs: { rows: 6, placeholder: 'Write...', class: 'mine', disabled: true },
    });
    const textarea = wrapper.find('textarea');
    expect(wrapper.find('label').attributes('for')).toBe('notes');
    expect(textarea.attributes('rows')).toBe('6');
    expect(textarea.attributes('placeholder')).toBe('Write...');
    expect(textarea.attributes('aria-invalid')).toBe('true');
    expect(textarea.element.disabled).toBe(true);
    expect(textarea.classes()).toEqual(expect.arrayContaining(['mine', 'min-h-24']));
    expect((wrapper.vm as unknown as { element: HTMLTextAreaElement }).element).toBe(textarea.element);
  });

  it('describes the textarea with the hint or the error, after the ids passed to it', async () => {
    const describedBy = ref<string | undefined>('bio-tips');
    const hint = ref<string | undefined>('Markdown is supported');
    const error = ref<string | undefined>();
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelTextarea, {
            label: 'Bio', id: 'bio',
            hint: hint.value,
            error: error.value,
            'aria-describedby': describedBy.value,
          }),
      }),
      { attachTo: document.body },
    );
    const control = wrapper.find('textarea');
    const message = () => document.getElementById('bio-msg')?.textContent;
    expect(control.attributes('aria-describedby')).toBe('bio-tips bio-msg');
    expect(message()).toBe('Markdown is supported');
    error.value = 'Too long';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('bio-tips bio-msg');
    expect(message()).toBe('Too long');
    hint.value = undefined;
    error.value = undefined;
    describedBy.value = 'bio-policy';
    await nextTick();
    expect(control.attributes('aria-describedby')).toBe('bio-policy');
    expect(message()).toBeUndefined();
    describedBy.value = undefined;
    await nextTick();
    expect(control.attributes()).not.toHaveProperty('aria-describedby');
    wrapper.unmount();
  });
});
