/**
 * PixelCenter beyond the parity examples: the rendered element, the
 * deprecated `text` alias, surface inheritance and attribute fall-through.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelCenter, PxlKitSurfaceProvider } from '../../index';

describe('PixelCenter', () => {
  it('renders the element it is given and passes attributes through', () => {
    const wrapper = mount(PixelCenter, {
      props: { as: 'main', maxWidth: 'prose' },
      attrs: { id: 'content', class: 'own' },
      slots: { default: () => 'Body' },
    });
    expect(wrapper.element.tagName).toBe('MAIN');
    expect(wrapper.attributes('id')).toBe('content');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['own', 'block', 'mx-auto', 'max-w-prose']));
    expect(wrapper.text()).toBe('Body');
  });

  it('prefers align over the deprecated text alias and follows prop changes', async () => {
    const wrapper = mount(PixelCenter, { props: { align: 'right', text: 'center' } });
    expect(wrapper.classes()).toContain('text-right');
    expect(wrapper.classes()).not.toContain('text-center');
    await wrapper.setProps({ align: undefined });
    expect(wrapper.classes()).toContain('text-center');
    await wrapper.setProps({ inline: true, bordered: true });
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['inline-block', 'border-2', 'border-retro-border']));
  });

  it('takes its surface from the nearest provider', () => {
    const wrapper = mount(() => h(PxlKitSurfaceProvider, { surface: 'linear' }, () => h(PixelCenter, { bordered: true })));
    const center = wrapper.find('div.mx-auto');
    expect(center.classes()).toEqual(expect.arrayContaining(['border', 'rounded-md']));
    expect(center.classes()).not.toContain('border-2');
  });
});
