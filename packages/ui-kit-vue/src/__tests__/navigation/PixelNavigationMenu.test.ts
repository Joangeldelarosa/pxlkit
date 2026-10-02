/**
 * PixelNavigationMenu beyond the parity examples: item handlers, a link with
 * a panel, panel content as a render function, and the landmark's name.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import { PixelNavigationMenu } from '../../index';

describe('PixelNavigationMenu', () => {
  it('runs onSelect on click and on Enter or Space, except Enter on a link, which the browser follows', async () => {
    const onButton = vi.fn();
    const onLink = vi.fn();
    const wrapper = mount(PixelNavigationMenu, {
      props: { items: [{ label: 'Act', onSelect: onButton }, { label: 'Go', href: '#go', onSelect: onLink }] },
    });
    const [button, link] = wrapper.findAll('[role="menuitem"]');
    await button!.trigger('click');
    await button!.trigger('keydown', { key: ' ' });
    await link!.trigger('click');
    await link!.trigger('keydown', { key: 'Enter' });
    expect(onButton).toHaveBeenCalledTimes(2);
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('toggles the panel of a link with content instead of following it', async () => {
    const wrapper = mount(PixelNavigationMenu, {
      props: { items: [{ label: 'Docs', href: '#docs', content: () => h('p', 'Guides') }] },
    });
    const link = wrapper.find('a');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.element.dispatchEvent(click);
    await wrapper.vm.$nextTick();
    expect(click.defaultPrevented).toBe(true);
    expect(wrapper.find('[role="menu"]').text()).toBe('Guides');
  });

  it('names the landmark', async () => {
    const wrapper = mount(PixelNavigationMenu, { props: { items: [{ label: 'Home', href: '/' }] } });
    expect(wrapper.attributes('aria-label')).toBe('Main navigation');
    await wrapper.setProps({ ariaLabel: 'Footer' });
    expect(wrapper.attributes('aria-label')).toBe('Footer');
  });
});
