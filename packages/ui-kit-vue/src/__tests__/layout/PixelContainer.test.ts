/**
 * PixelContainer beyond the parity examples: the default landmark, attribute
 * fall-through onto the band and the inner column it derives from `padding`.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelContainer, PxlKitSurfaceProvider } from '../../index';

describe('PixelContainer', () => {
  it('renders a section band around a centred column, with attributes on the band', () => {
    const wrapper = mount(PixelContainer, {
      attrs: { 'aria-labelledby': 'heading', class: 'own' },
      slots: { default: () => h('h2', { id: 'heading' }, 'Title') },
    });
    expect(wrapper.element.tagName).toBe('SECTION');
    expect(wrapper.attributes('aria-labelledby')).toBe('heading');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['own', 'w-full', 'py-16']));
    const column = wrapper.element.firstElementChild as HTMLElement;
    expect(column.tagName).toBe('DIV');
    expect(Array.from(column.classList)).toEqual(expect.arrayContaining(['mx-auto', 'max-w-5xl', 'lg:px-8']));
    expect(column.querySelector('#heading')?.textContent).toBe('Title');
  });

  it('splits padding into the column gutter and the band rhythm, following changes', async () => {
    const wrapper = mount(PixelContainer, { props: { as: 'div', padding: { x: 'sm', y: 'none' } } });
    const column = () => wrapper.element.firstElementChild as HTMLElement;
    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.classes()).toContain('py-0');
    expect(Array.from(column().classList)).toContain('px-3');
    await wrapper.setProps({ padding: 'xl', maxWidth: 'prose' });
    expect(wrapper.classes()).toContain('py-20');
    expect(Array.from(column().classList)).toEqual(expect.arrayContaining(['lg:px-8', 'max-w-prose']));
  });

  it('hands its surface down to the column', () => {
    const wrapper = mount(() => h(PxlKitSurfaceProvider, { surface: 'linear' }, () => h(PixelContainer)));
    const band = wrapper.find('section');
    expect(band.classes()).toContain('duration-200');
    expect(band.element.firstElementChild!.classList.contains('duration-200')).toBe(true);
  });
});
