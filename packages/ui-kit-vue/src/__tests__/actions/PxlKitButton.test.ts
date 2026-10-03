/**
 * PxlKitButton, the deprecated name of PixelIconButton: the label naming the
 * button, the icon slot, the disabled state and fall-through attributes.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import { PixelIconButton, PxlKitButton } from '../../index';

describe('PxlKitButton', () => {
  it('is PixelIconButton under its former name', () => {
    expect(PxlKitButton).toBe(PixelIconButton);
  });

  it('is named by its label, as aria-label and title, around the icon slot', () => {
    const wrapper = mount(PxlKitButton, {
      props: { label: 'Settings' },
      slots: { icon: () => h('svg', { 'data-testid': 'gear' }) },
    });
    expect(wrapper.attributes('aria-label')).toBe('Settings');
    expect(wrapper.attributes('title')).toBe('Settings');
    expect(wrapper.find('span > [data-testid="gear"]').exists()).toBe(true);
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-10', 'w-10', 'text-retro-cyan']));
  });

  it('takes tone and size', () => {
    const wrapper = mount(PxlKitButton, { props: { label: 'Go', tone: 'red', size: 'sm' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-8', 'w-8', 'text-retro-red']));
  });

  it('disables the button and drops its shadows', () => {
    const enabled = mount(PxlKitButton, { props: { label: 'Go' } });
    const disabled = mount(PxlKitButton, { props: { label: 'Go', disabled: true } });
    expect(enabled.attributes('disabled')).toBeUndefined();
    expect(enabled.classes()).toContain('pxl-shadow');
    expect((disabled.element as HTMLButtonElement).disabled).toBe(true);
    expect(disabled.classes()).not.toContain('pxl-shadow');
  });

  it('passes attributes and listeners through to the button', async () => {
    const onClick = vi.fn();
    const wrapper = mount(PxlKitButton, { props: { label: 'Go' }, attrs: { type: 'submit', class: 'own', onClick } });
    expect(wrapper.attributes('type')).toBe('submit');
    expect(wrapper.classes()).toContain('own');
    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
