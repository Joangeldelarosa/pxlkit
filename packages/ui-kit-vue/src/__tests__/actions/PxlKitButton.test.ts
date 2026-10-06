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

  it('disables the button and drops its moves', () => {
    const enabled = mount(PxlKitButton, { props: { label: 'Go' } });
    const disabled = mount(PxlKitButton, { props: { label: 'Go', disabled: true } });
    expect(enabled.attributes('disabled')).toBeUndefined();
    expect(enabled.classes()).toEqual(expect.arrayContaining(['pxl-nudge-hover', 'pxl-nudge-active']));
    expect((disabled.element as HTMLButtonElement).disabled).toBe(true);
    for (const name of ['pxl-shadow', 'pxl-nudge-hover', 'pxl-nudge-active']) expect(disabled.classes()).not.toContain(name);
  });

  it('moves a pixel button on hover and press without a drop shadow, which its cut corners would clip', () => {
    const classes = mount(PxlKitButton, { props: { label: 'Go' } }).classes();
    expect(classes).toContain('pxl-corner-sm');
    for (const shadow of ['pxl-shadow', 'pxl-shadow-hover', 'pxl-shadow-active']) expect(classes).not.toContain(shadow);
    const linear = mount(PxlKitButton, { props: { label: 'Go', surface: 'linear' } }).classes();
    expect(linear).toEqual(expect.arrayContaining(['shadow-sm', 'hover:shadow-md', 'active:shadow-sm']));
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
