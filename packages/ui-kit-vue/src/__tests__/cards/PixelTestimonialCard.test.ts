/**
 * PixelTestimonialCard beyond the parity examples: the avatar photo and
 * initials, the star rating, the actions slot, and the person's role kept
 * off the article's attributes.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelTestimonialCard } from '../../index';

describe('PixelTestimonialCard', () => {
  it('shows the photo, named by the avatar, or the initials hidden from assistive technology', async () => {
    const wrapper = mount(PixelTestimonialCard, {
      props: { quote: 'Q', name: 'Ada Lovelace', avatar: { src: 'ada.png', name: 'Ada' } },
    });
    const avatar = wrapper.find('[data-pxl-avatar]');
    expect(avatar.attributes('aria-hidden')).toBeUndefined();
    expect(avatar.find('img').attributes()).toMatchObject({ src: 'ada.png', alt: 'Ada' });
    await wrapper.setProps({ avatar: { name: 'Grace Hopper', tone: 'pink' } });
    expect(avatar.attributes('aria-hidden')).toBe('true');
    expect(avatar.text()).toBe('GH');
    expect(avatar.classes()).toContain('text-retro-pink');
    await wrapper.setProps({ avatar: undefined });
    expect(avatar.text()).toBe('AL');
  });

  it('rates with stars only when there are some, and badges the verified as a named image', async () => {
    const wrapper = mount(PixelTestimonialCard, { props: { quote: 'Q', name: 'Ada', stars: 0, verified: true } });
    expect(wrapper.find('[role="img"][aria-label$="out of 5"]').exists()).toBe(false);
    expect(wrapper.find('[data-pxl-verified]').attributes()).toMatchObject({ role: 'img', 'aria-label': 'Verified' });
    await wrapper.setProps({ stars: 3 });
    expect(wrapper.find('[aria-label="3 out of 5"]').exists()).toBe(true);
  });

  it('fills its actions slot, joins role and company, and keeps the role off the article', () => {
    const wrapper = mount(PixelTestimonialCard, {
      props: { quote: 'Shipped.', name: 'Ana', role: 'PM', company: 'Acme', variant: 'quote' },
      attrs: { id: 'ana' },
      slots: { actions: () => h('a', { href: '/story' }, 'Story') },
    });
    expect(wrapper.element.tagName).toBe('ARTICLE');
    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('id')).toBe('ana');
    expect(wrapper.find('blockquote').text()).toBe('“Shipped.”');
    expect(wrapper.find('div.pt-1 > a').text()).toBe('Story');
    expect(wrapper.find('.truncate.text-xs').text()).toBe('PM · Acme');
    expect(wrapper.classes()).not.toContain('border-retro-border');
  });
});
