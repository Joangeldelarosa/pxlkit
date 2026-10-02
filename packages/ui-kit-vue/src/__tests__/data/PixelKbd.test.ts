/**
 * PixelKbd: the surface of the nearest provider and attribute fall-through.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelKbd, PxlKitSurfaceProvider } from '../../index';

describe('PixelKbd', () => {
  it('takes the surface of the nearest provider', () => {
    const wrapper = mount(() => h(PxlKitSurfaceProvider, { surface: 'linear' }, () => h(PixelKbd, () => 'K')));
    expect(wrapper.find('kbd').classes()).toContain('shadow-[0_1px_0_0_rgba(0,0,0,0.15)]');
  });

  it('passes attributes to the <kbd> element', () => {
    const wrapper = mount(PixelKbd, { attrs: { 'aria-label': 'Command' }, slots: { default: () => '⌘' } });
    expect(wrapper.element.tagName).toBe('KBD');
    expect(wrapper.attributes('aria-label')).toBe('Command');
  });
});
