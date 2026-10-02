/**
 * PixelNavigationMenu beyond the parity examples: item handlers, an item
 * with both an href and a panel, panel content as a render function, a tap
 * on a touch screen, and the landmark's name.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import { PixelNavigationMenu } from '../../index';

enableAutoUnmount(afterEach);

/**
 * A tap on a touch screen: the touch pointer's events, then the
 * compatibility mouse events and focus, and the click last.
 */
function tap(element: HTMLElement) {
  for (const type of ['pointerover', 'pointerenter', 'pointerdown', 'pointerup', 'pointerout', 'pointerleave']) {
    element.dispatchEvent(new PointerEvent(type, { bubbles: !type.endsWith('enter') && !type.endsWith('leave'), pointerType: 'touch' }));
  }
  for (const type of ['mouseover', 'mouseenter', 'mousemove', 'mousedown']) {
    element.dispatchEvent(new MouseEvent(type, { bubbles: type !== 'mouseenter' }));
  }
  element.focus();
  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  element.click();
}

describe('PixelNavigationMenu', () => {
  it('runs onSelect on click, and leaves Enter and Space to the browser, which clicks', async () => {
    const onButton = vi.fn();
    const onLink = vi.fn();
    const wrapper = mount(PixelNavigationMenu, {
      props: { items: [{ label: 'Act', onSelect: onButton }, { label: 'Go', href: '#go', onSelect: onLink }] },
    });
    const button = wrapper.get('button');
    await button.trigger('click');
    await button.trigger('keydown', { key: 'Enter' });
    await button.trigger('keydown', { key: ' ' });
    await wrapper.get('a').trigger('click');
    expect(onButton).toHaveBeenCalledTimes(1);
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('makes an item with an href and content a button that toggles its panel, given as a render function', async () => {
    const wrapper = mount(PixelNavigationMenu, {
      props: { items: [{ label: 'Docs', href: '#docs', content: () => h('p', 'Guides') }] },
    });
    expect(wrapper.find('a').exists()).toBe(false);
    const button = wrapper.get('button');
    await button.trigger('click');
    expect(wrapper.get(`[id="${button.attributes('aria-controls')}"]`).text()).toBe('Guides');
    await button.trigger('click');
    expect(wrapper.find('li > div').exists()).toBe(false);
  });

  // A tap fires the pointer, mouse and focus events of a hover before its
  // click: only the click may open the panel, or the click closes it again.
  it('opens a panel on a tap, and keeps it open', async () => {
    const wrapper = mount(PixelNavigationMenu, {
      props: { items: [{ label: 'Products', content: 'Links' }] },
      attachTo: document.body,
    });
    const button = wrapper.get('button').element;
    tap(button);
    await nextTick();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(wrapper.get('li > div').text()).toBe('Links');
    tap(button);
    await nextTick();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens nothing for a pen pointing at an item', async () => {
    const wrapper = mount(PixelNavigationMenu, { props: { items: [{ label: 'Products', content: 'Links' }] } });
    wrapper.get('button').element.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'pen' }));
    await nextTick();
    expect(wrapper.find('li > div').exists()).toBe(false);
  });

  it('names the landmark', async () => {
    const wrapper = mount(PixelNavigationMenu, { props: { items: [{ label: 'Home', href: '/' }] } });
    expect(wrapper.attributes('aria-label')).toBe('Main navigation');
    await wrapper.setProps({ ariaLabel: 'Footer' });
    expect(wrapper.attributes('aria-label')).toBe('Footer');
  });
});
