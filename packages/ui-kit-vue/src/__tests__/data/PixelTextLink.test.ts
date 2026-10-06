/**
 * PixelTextLink: anchor or button, with attributes and listeners passed through.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { PixelTextLink } from '../../index';

describe('PixelTextLink', () => {
  it('is an anchor with an href, passing anchor attributes through', () => {
    const wrapper = mount(PixelTextLink, {
      props: { href: '/docs' },
      attrs: { target: '_blank', rel: 'noopener' },
      slots: { default: () => 'Docs' },
    });
    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes()).toMatchObject({ href: '/docs', target: '_blank', rel: 'noopener' });
    expect(wrapper.attributes('type')).toBeUndefined();
  });

  it('is a button without one, firing click listeners and taking an own type', async () => {
    const onClick = vi.fn();
    const wrapper = mount(PixelTextLink, { attrs: { onClick }, slots: { default: () => 'Undo' } });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mount(PixelTextLink, { attrs: { type: 'submit' } }).attributes('type')).toBe('submit');
  });
});
