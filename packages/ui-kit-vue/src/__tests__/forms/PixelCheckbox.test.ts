/**
 * PixelCheckbox v-model:checked, uncontrolled behaviour, form serialisation,
 * attribute passthrough and the exposed button.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelCheckbox } from '../../index';

describe('PixelCheckbox', () => {
  it('updates a v-model:checked binding', async () => {
    const on = ref(false);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelCheckbox, { label: 'Accept', checked: on.value, 'onUpdate:checked': (v: boolean) => (on.value = v) }),
      }),
    );
    await wrapper.find('[role="checkbox"]').trigger('click');
    expect(on.value).toBe(true);
    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('true');
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('stays as its parent says while controlled one-way', async () => {
    const wrapper = mount(PixelCheckbox, { props: { label: 'Frozen', checked: false } });
    await wrapper.find('[role="checkbox"]').trigger('click');
    expect(wrapper.emitted('update:checked')).toEqual([[true]]);
    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('false');
  });

  it('keeps its own state while uncontrolled, and none while disabled', async () => {
    const wrapper = mount(PixelCheckbox, { props: { label: 'Opt in', defaultChecked: true } });
    await wrapper.find('[role="checkbox"]').trigger('click');
    expect(wrapper.find('[role="checkbox"]').attributes('aria-checked')).toBe('false');
    expect(wrapper.emitted('update:checked')).toEqual([[false]]);
    const disabled = mount(PixelCheckbox, { props: { label: 'Locked', disabled: true } });
    await disabled.find('[role="checkbox"]').trigger('click');
    expect(disabled.emitted('update:checked')).toBeUndefined();
    expect(disabled.find('[role="checkbox"]').attributes('aria-disabled')).toBe('true');
  });

  it('submits its value only while checked when named', async () => {
    const wrapper = mount(PixelCheckbox, { props: { label: 'News', name: 'news', value: 'yes', required: true } });
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false);
    expect(wrapper.find('[role="checkbox"]').attributes('aria-required')).toBe('true');
    await wrapper.find('[role="checkbox"]').trigger('click');
    const hidden = wrapper.find('input[type="hidden"]').element as HTMLInputElement;
    expect(hidden.name).toBe('news');
    expect(hidden.value).toBe('yes');
  });

  it('passes extra attributes to the checkbox button and exposes it', () => {
    const wrapper = mount(PixelCheckbox, { props: { label: 'X', id: 'cb' }, attrs: { 'aria-describedby': 'help' } });
    const button = wrapper.find('[role="checkbox"]');
    expect(button.attributes('id')).toBe('cb');
    expect(button.attributes('aria-describedby')).toBe('help');
    expect((wrapper.vm as unknown as { element: HTMLButtonElement }).element).toBe(button.element);
  });

  it('draws keyboard focus on its box: inside the cut corners on the pixel surface, a ring in its tone on the linear one', () => {
    const box = (surface: 'pixel' | 'linear') =>
      mount(PixelCheckbox, { props: { label: 'Box', tone: 'red', surface } }).get('[role="checkbox"] > span').classes();
    expect(box('pixel')).toContain('group-focus-visible:pxl-focus-inset');
    expect(box('pixel').filter((c) => c.includes('ring'))).toEqual([]);
    expect(box('linear')).toEqual(expect.arrayContaining(['group-focus-visible:ring-2', 'group-focus-visible:ring-retro-red/40']));
  });
});
