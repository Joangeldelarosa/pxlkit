/**
 * PixelSwitch v-model and uncontrolled behaviour.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { PixelSwitch } from '../../index';

describe('PixelSwitch', () => {
  it('updates a v-model:checked binding', async () => {
    const on = ref(false);
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(PixelSwitch, { label: 'Notify', checked: on.value, 'onUpdate:checked': (v: boolean) => (on.value = v) }),
      }),
    );
    await wrapper.find('[role="switch"]').trigger('click');
    expect(on.value).toBe(true);
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('true');
  });

  it('stays as its parent says while controlled one-way', async () => {
    const wrapper = mount(PixelSwitch, { props: { label: 'Notify', checked: false } });
    await wrapper.find('[role="switch"]').trigger('click');
    expect(wrapper.emitted('update:checked')).toEqual([[true]]);
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false');
  });

  it('keeps its own state while uncontrolled', async () => {
    const wrapper = mount(PixelSwitch, { props: { label: 'Notify', defaultChecked: true } });
    await wrapper.find('[role="switch"]').trigger('click');
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false');
    expect(wrapper.emitted('update:checked')).toEqual([[false]]);
  });

  it('passes extra attributes to the switch button', () => {
    const wrapper = mount(PixelSwitch, { props: { label: 'Notify', id: 'n' }, attrs: { 'aria-describedby': 'help' } });
    const button = wrapper.find('[role="switch"]');
    expect(button.attributes('id')).toBe('n');
    expect(button.attributes('aria-describedby')).toBe('help');
  });
});
