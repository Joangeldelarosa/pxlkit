/**
 * PixelSectionHeader beyond the parity examples: the heading level, the
 * eyebrow repeated for screen readers, the actions slot and attribute
 * fall-through onto the header.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelSectionHeader } from '../../index';

describe('PixelSectionHeader', () => {
  it('heads with the level it is given and repeats the eyebrow for screen readers only', async () => {
    const wrapper = mount(PixelSectionHeader, {
      props: { title: 'Pricing', eyebrow: 'Plans', as: 'h3' },
      attrs: { id: 'pricing', class: 'own' },
    });
    expect(wrapper.element.tagName).toBe('HEADER');
    expect(wrapper.attributes('id')).toBe('pricing');
    expect(wrapper.attributes('title')).toBeUndefined();
    expect(wrapper.classes()).toEqual(['w-full', 'own']);
    expect(wrapper.find('span[aria-hidden="true"]').text()).toBe('Plans');
    const heading = wrapper.find('h3');
    expect(heading.find('.sr-only').text()).toBe('Plans:');
    expect(heading.text()).toBe('Plans: Pricing');
    await wrapper.setProps({ as: 'h4', eyebrow: undefined });
    expect(wrapper.find('h4').text()).toBe('Pricing');
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false);
  });

  it('renders the actions row only for an actions slot', () => {
    const plain = mount(PixelSectionHeader, { props: { title: 'Pricing' } });
    expect(plain.findAll('.flex-wrap')).toHaveLength(0);
    const withActions = mount(PixelSectionHeader, {
      props: { title: 'Pricing', align: 'center' },
      slots: { actions: () => h('a', { href: '#plans' }, 'See plans') },
    });
    const actions = withActions.find('a').element.parentElement!;
    expect(Array.from(actions.classList)).toEqual(expect.arrayContaining(['flex', 'flex-wrap', 'justify-center']));
  });
});
