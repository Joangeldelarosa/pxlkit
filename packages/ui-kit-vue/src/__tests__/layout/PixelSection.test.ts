/**
 * PixelSection beyond the parity examples: the locale of the title, and
 * moving the content between the centred column and the full width.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelSection, PxlKitLocaleProvider } from '../../index';

describe('PixelSection', () => {
  it('upper-cases the title for the locale of the nearest provider', () => {
    const wrapper = mount(() =>
      h(PxlKitLocaleProvider, { locale: 'tr' }, () => h(PixelSection, { title: 'istanbul' }, () => 'Body')),
    );
    expect(wrapper.find('h3').text()).toBe('İSTANBUL');
  });

  it('moves its content between the centred column and the full width', async () => {
    const wrapper = mount(PixelSection, {
      props: { title: 'Stats', subtitle: 'This week', horizontalGutter: 'sm' },
      slots: { default: () => h('p', { id: 'body' }, 'Body') },
    });
    const column = () => wrapper.element.firstElementChild as HTMLElement;
    expect(column().classList.contains('mx-auto')).toBe(true);
    expect(column().querySelector('h3 + p')?.textContent).toBe('This week');
    expect(column().querySelector('#body')).not.toBeNull();
    expect(wrapper.classes()).not.toContain('px-3');
    await wrapper.setProps({ container: false });
    expect(wrapper.classes()).toContain('px-3');
    expect(wrapper.find('.mx-auto').exists()).toBe(false);
    expect(Array.from((wrapper.element as HTMLElement).children).map((child) => child.tagName)).toEqual(['DIV', 'P']);
    expect(wrapper.find('#body').text()).toBe('Body');
  });
});
