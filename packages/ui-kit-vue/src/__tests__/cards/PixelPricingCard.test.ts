/**
 * PixelPricingCard beyond the parity examples: its slots, the feature list's
 * marks, labels and tooltips, the old price and the popular ribbon.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelPricingCard } from '../../index';

describe('PixelPricingCard', () => {
  it('fills its icon, price badge, call to action and footer slots', () => {
    const wrapper = mount(PixelPricingCard, {
      props: { name: 'Pro', price: { amount: 29 } },
      attrs: { id: 'pro' },
      slots: {
        icon: () => h('i', 'icon'),
        'price-badge': () => 'NEW',
        cta: () => h('button', 'Buy'),
        footer: () => 'Billed yearly',
      },
    });
    expect(wrapper.element.tagName).toBe('ARTICLE');
    expect(wrapper.attributes('id')).toBe('pro');
    expect(wrapper.find('[aria-hidden="true"] > i').text()).toBe('icon');
    expect(wrapper.find('[data-pxl-price-badge-slot]').text()).toBe('NEW');
    expect(wrapper.find('div.mt-5 > button').text()).toBe('Buy');
    expect(wrapper.find('div.mt-3').text()).toBe('Billed yearly');
  });

  it('keeps the ribbon row and the description, empty, and announces the old price even when 0', () => {
    const wrapper = mount(PixelPricingCard, { props: { name: 'Free', price: { amount: '$0', strikethrough: 0 } } });
    expect(wrapper.find('[data-pxl-ribbon-slot]').text()).toBe('');
    expect(wrapper.find('[data-pxl-description-slot]').text()).toBe('');
    expect(wrapper.find('s').text()).toBe('Previous price 0');
    expect(wrapper.find('ul').exists()).toBe(false);
  });

  it('checks included features, crosses out excluded ones and shows their tooltips', () => {
    const wrapper = mount(PixelPricingCard, {
      props: {
        name: 'Pro',
        tone: 'cyan',
        price: { amount: 29 },
        features: [{ label: 'SSO', tooltip: 'Single sign-on', highlight: true }, { label: 'Audit log', included: false }],
      },
    });
    const [sso, audit] = wrapper.findAll('li');
    expect(sso!.find('svg').exists()).toBe(true);
    expect(sso!.findAll('span')[1]!.attributes('title')).toBe('Single sign-on');
    expect(sso!.findAll('span')[1]!.classes()).toEqual(['text-retro-cyan', 'font-medium']);
    expect(sso!.text()).toBe('Included: SSO');
    expect(audit!.findAll('span')[1]!.attributes('title')).toBeUndefined();
    expect(audit!.findAll('span')[1]!.classes()).toContain('line-through');
    expect(audit!.text()).toBe('Not included: Audit log');
  });

  it('labels the popular ribbon POPULAR unless told otherwise, in its own tone', async () => {
    const wrapper = mount(PixelPricingCard, { props: { name: 'Pro', price: { amount: 29 }, popular: {} } });
    expect(wrapper.find('[data-pxl-ribbon-slot] span').text()).toBe('POPULAR');
    await wrapper.setProps({ popular: { label: 'BEST VALUE', tone: 'red' } });
    const ribbon = wrapper.find('[data-pxl-ribbon-slot] span');
    expect(ribbon.text()).toBe('BEST VALUE');
    expect(ribbon.classes()).toContain('bg-retro-red/18');
  });
});
