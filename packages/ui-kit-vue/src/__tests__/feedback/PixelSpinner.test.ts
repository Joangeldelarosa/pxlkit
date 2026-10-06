/**
 * PixelSpinner: reduced motion, the decorative mode and attribute
 * fall-through. Rendering is covered against React by the parity suite.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { PixelSpinner } from '../../index';
import { installMatchMedia } from '../match-media';

const blade = (element: Element) => element.querySelector<HTMLElement>('[data-pxl-spinner-blade]')!;

afterEach(() => {
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('PixelSpinner', () => {
  it('turns until the user asks for reduced motion, keeping its shape', async () => {
    const lists = installMatchMedia(() => false);
    const wrapper = mount(PixelSpinner, { props: { surface: 'linear' } });
    await nextTick();
    expect(blade(wrapper.element).style.animation).toContain('pxl-spinner-smooth');
    for (const list of lists) list.fire(true);
    await nextTick();
    expect(blade(wrapper.element).getAttribute('style')).toBeNull();
    expect(blade(wrapper.element).classList).toContain('rounded-full');
  });

  it('starts frozen when reduced motion is already on', async () => {
    installMatchMedia((query) => query === '(prefers-reduced-motion: reduce)');
    const wrapper = mount(PixelSpinner);
    await nextTick();
    expect(blade(wrapper.element).getAttribute('style')).toBeNull();
  });

  it('is a named status, or pure decoration', async () => {
    const wrapper = mount(PixelSpinner, { props: { label: 'Cargando' } });
    expect(wrapper.attributes()).toMatchObject({ role: 'status', 'aria-label': 'Cargando' });
    expect(wrapper.find('.sr-only').text()).toBe('Cargando');
    await wrapper.setProps({ decorative: true });
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('aria-label')).toBeUndefined();
    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.sr-only').exists()).toBe(false);
  });

  it('passes classes and attributes through, an aria-label overriding the label', () => {
    const wrapper = mount(PixelSpinner, { attrs: { class: 'ml-2', 'aria-label': 'Busy', id: 'spin' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['ml-2', 'h-4', 'w-4', 'text-retro-cyan']));
    expect(wrapper.attributes()).toMatchObject({ 'aria-label': 'Busy', id: 'spin' });
  });
});
