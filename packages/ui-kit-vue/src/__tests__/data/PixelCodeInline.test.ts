/**
 * PixelCodeInline: the surface of the nearest provider and attribute fall-through.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelCodeInline, PxlKitSurfaceProvider } from '../../index';

describe('PixelCodeInline', () => {
  it('takes the surface of the nearest provider unless it sets its own', () => {
    const wrapper = mount(() =>
      h(PxlKitSurfaceProvider, { surface: 'linear' }, () => [
        h(PixelCodeInline, () => 'inherited'),
        h(PixelCodeInline, { surface: 'pixel' }, () => 'own'),
      ]),
    );
    const [inherited, own] = wrapper.findAll('code');
    expect(inherited!.classes()).toContain('rounded-md');
    expect(own!.classes()).toContain('pxl-corner-sm');
  });

  it('passes attributes to the <code> element', () => {
    const wrapper = mount(PixelCodeInline, { attrs: { title: 'command' }, slots: { default: () => 'pnpm dev' } });
    expect(wrapper.element.tagName).toBe('CODE');
    expect(wrapper.attributes('title')).toBe('command');
  });
});
