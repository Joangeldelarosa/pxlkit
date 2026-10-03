/**
 * PixelCard beyond the parity examples: keyboard activation of an
 * interactive card, the link and button roots, slots, the composed header
 * and where attributes and listeners go.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import { PixelCard, PixelCardHeader, PxlKitSurfaceProvider } from '../../index';

const key = (name: string) => new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });

describe('PixelCard', () => {
  it('is a button in the tab order when interactive, which Enter and Space activate', () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelCard, { props: { title: 'Open', interactive: true, onClick } });
    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.attributes()).toMatchObject({ role: 'button', tabindex: '0' });

    const enter = key('Enter');
    wrapper.element.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    const space = key(' ');
    wrapper.element.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    wrapper.element.dispatchEvent(key('a'));
    expect(onClick.mock.calls.map(([event]) => (event as KeyboardEvent).key)).toEqual(['Enter', ' ']);
  });

  it('lets a keydown listener of its own keep Enter from activating it', () => {
    const onClick = vi.fn();
    const onKeydown = vi.fn((event: KeyboardEvent) => event.preventDefault());
    const wrapper = mount(PixelCard, { props: { interactive: true, onClick }, attrs: { onKeydown } });
    wrapper.element.dispatchEvent(key('Enter'));
    expect(onKeydown).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is clicked, not activated by keys, as an article or a link', () => {
    const onClick = vi.fn();
    const article = mount(PixelCard, { props: { title: 'Plain', onClick } });
    expect(article.element.tagName).toBe('ARTICLE');
    expect(article.attributes('role')).toBeUndefined();
    article.element.dispatchEvent(key('Enter'));
    expect(onClick).not.toHaveBeenCalled();
    article.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);

    const link = mount(PixelCard, { props: { href: '/docs', interactive: true, target: '_blank', rel: 'noopener', onClick } });
    expect(link.element.tagName).toBe('A');
    expect(link.attributes()).toMatchObject({ href: '/docs', target: '_blank', rel: 'noopener' });
    expect(link.attributes('role')).toBeUndefined();
    link.element.dispatchEvent(key('Enter'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps target and rel off a card without a link, and lets the consumer attributes win', () => {
    const wrapper = mount(PixelCard, {
      props: { interactive: true, target: '_blank', rel: 'noopener' },
      attrs: { role: 'link', tabindex: '-1', class: 'h-full', 'data-id': 'c1' },
    });
    expect(wrapper.attributes('target')).toBeUndefined();
    expect(wrapper.attributes('rel')).toBeUndefined();
    expect(wrapper.attributes()).toMatchObject({ role: 'link', tabindex: '-1', 'data-id': 'c1' });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-full', 'cursor-pointer']));
  });

  it('fills its slots, and wraps the body only when there is one', () => {
    const wrapper = mount(PixelCard, {
      props: { title: 'Card' },
      slots: {
        icon: () => h('i', { 'data-test': 'icon' }),
        media: () => h('img', { alt: '' }),
        footer: () => 'Footer',
      },
    });
    expect(wrapper.find('header span [data-test="icon"]').exists()).toBe(true);
    expect(wrapper.find('div.overflow-hidden > img').exists()).toBe(true);
    expect(wrapper.find('footer').text()).toBe('Footer');
    expect(wrapper.find('div.text-sm.text-retro-muted').exists()).toBe(false);
    expect(wrapper.classes()).toContain('overflow-hidden');
  });

  it('replaces its title header with a PixelCardHeader among its direct children', () => {
    const composed = mount(PixelCard, { props: { title: 'Implicit' }, slots: { default: () => [h(PixelCardHeader, () => 'Own'), h('p', 'Body')] } });
    expect(composed.findAll('header').map((header) => header.text())).toEqual(['Own']);
    const nested = mount(PixelCard, { props: { title: 'Implicit' }, slots: { default: () => h('div', [h(PixelCardHeader, () => 'Own')]) } });
    expect(nested.findAll('header').map((header) => header.text())).toEqual(['Implicit', 'Own']);
  });

  it('draws its ribbon on the surface of the nearest provider', () => {
    const wrapper = mount(() =>
      h(PxlKitSurfaceProvider, { surface: 'linear' }, () => h(PixelCard, { badge: { label: 'HOT', tone: 'red' } }, () => 'Body')),
    );
    const ribbon = wrapper.find('article > div.absolute');
    expect(ribbon.text()).toBe('HOT');
    expect(ribbon.classes()).toEqual(expect.arrayContaining(['rounded-md', 'bg-retro-red', 'right-4']));
    expect(wrapper.find('article').classes()).toEqual(expect.arrayContaining(['rounded-xl', 'overflow-hidden']));
  });
});
