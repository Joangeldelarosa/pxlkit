/**
 * PixelCluster beyond the parity examples: the rendered element, attribute
 * fall-through and prop changes.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelCluster } from '../../index';

describe('PixelCluster', () => {
  it('renders the element it is given and passes attributes through', () => {
    const wrapper = mount(PixelCluster, {
      props: { as: 'ul' },
      attrs: { 'aria-label': 'Tags', class: 'own' },
      slots: { default: () => [h('li', 'a'), h('li', 'b')] },
    });
    expect(wrapper.element.tagName).toBe('UL');
    expect(wrapper.attributes('aria-label')).toBe('Tags');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['own', 'flex', 'flex-row', 'flex-wrap', 'gap-4', 'items-center']));
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('follows its gap, alignment and distribution', async () => {
    const wrapper = mount(PixelCluster, { props: { gap: 2, align: 'baseline', justify: 'end' } });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['gap-2', 'items-baseline', 'justify-end']));
    await wrapper.setProps({ justify: undefined, align: 'start' });
    expect(wrapper.classes()).toContain('items-start');
    expect(wrapper.classes().some((name) => name.startsWith('justify-'))).toBe(false);
  });
});
