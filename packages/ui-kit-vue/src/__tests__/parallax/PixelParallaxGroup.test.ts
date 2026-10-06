/**
 * PixelParallaxGroup: the element it renders, and the classes, styles and
 * attributes of the consumer's on it.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PixelParallaxGroup } from '../../index';

describe('PixelParallaxGroup', () => {
  it('renders a div that positions and clips its layers, or the element it is given', async () => {
    const wrapper = mount(PixelParallaxGroup, { slots: { default: () => 'Layers' } });
    expect(wrapper.element.tagName).toBe('DIV');
    expect(wrapper.classes()).toEqual(['relative', 'overflow-hidden']);
    expect(wrapper.text()).toBe('Layers');
    for (const as of ['section', 'header', 'main'] as const) {
      await wrapper.setProps({ as });
      expect(wrapper.element.tagName).toBe(as.toUpperCase());
    }
  });

  it('takes the consumer classes, styles and attributes', () => {
    const wrapper = mount(PixelParallaxGroup, { attrs: { class: 'h-64', style: { height: '300px' }, 'aria-label': 'Scene' } });
    expect(wrapper.classes()).toEqual(['relative', 'overflow-hidden', 'h-64']);
    expect((wrapper.element as HTMLElement).style.height).toBe('300px');
    expect(wrapper.attributes('aria-label')).toBe('Scene');
  });
});
