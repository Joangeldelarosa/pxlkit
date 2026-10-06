/**
 * PixelFeatureCard beyond the parity examples: keyboard activation of an
 * interactive card, the link and button roots, the deprecated aliases and
 * where slots, attributes and listeners go.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import { PixelFeatureCard } from '../../index';

const key = (name: string) => new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });

describe('PixelFeatureCard', () => {
  it('is a button in the tab order when interactive, which Enter and Space activate', () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelFeatureCard, { props: { title: 'Open', interactive: true, onClick } });
    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.attributes()).toMatchObject({ role: 'button', tabindex: '0' });
    const enter = key('Enter');
    wrapper.element.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    wrapper.element.dispatchEvent(key(' '));
    wrapper.element.dispatchEvent(key('Escape'));
    expect(onClick).toHaveBeenCalledTimes(2);
    wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('lets a keydown listener of its own keep Enter from activating it', () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelFeatureCard, {
      props: { title: 'Open', interactive: true, onClick },
      attrs: { onKeydown: (event: KeyboardEvent) => event.preventDefault() },
    });
    wrapper.element.dispatchEvent(key('Enter'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is a link with any href, even an empty one, and keeps the link attributes to links', () => {
    const onClick = vi.fn();
    const link = mount(PixelFeatureCard, {
      props: { title: 'Docs', href: '', target: '_blank', rel: 'noopener', download: 'guide.pdf', interactive: true, onClick },
    });
    expect(link.element.tagName).toBe('A');
    expect(link.attributes()).toMatchObject({ href: '', target: '_blank', rel: 'noopener', download: 'guide.pdf' });
    expect(link.attributes('role')).toBeUndefined();
    link.element.dispatchEvent(key('Enter'));
    expect(onClick).not.toHaveBeenCalled();

    const article = mount(PixelFeatureCard, { props: { title: 'Plain', target: '_blank', rel: 'noopener', download: 'x' } });
    expect(article.element.tagName).toBe('ARTICLE');
    expect(['target', 'rel', 'download', 'role', 'tabindex'].map((name) => article.attributes(name))).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('reads the deprecated description aliases, which the new props win over', async () => {
    const wrapper = mount(PixelFeatureCard, { props: { title: 'T', desc: 'Legacy', descLines: 2 } });
    expect(wrapper.find('p').text()).toBe('Legacy');
    expect(wrapper.find('p').classes()).toContain('line-clamp-2');
    await wrapper.setProps({ description: 'Current', descriptionLines: 4 });
    expect(wrapper.find('p').text()).toBe('Current');
    expect(wrapper.find('p').classes()).toContain('line-clamp-4');
  });

  it('renders its icon and footer slots, the default slot after them, and the consumer attributes', () => {
    const wrapper = mount(PixelFeatureCard, {
      props: { title: 'T', orientation: 'horizontal' },
      attrs: { class: 'h-full', 'aria-label': 'Feature' },
      slots: { icon: () => h('i', 'icon'), footer: () => 'More', default: () => h('em', 'extra') },
    });
    expect(wrapper.find('[data-pxl-icon-frame] i').text()).toBe('icon');
    expect(wrapper.find('.min-w-0 > div').text()).toBe('More');
    expect(wrapper.element.lastElementChild!.tagName).toBe('EM');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['h-full', 'grid']));
    expect(wrapper.attributes('aria-label')).toBe('Feature');
  });
});
