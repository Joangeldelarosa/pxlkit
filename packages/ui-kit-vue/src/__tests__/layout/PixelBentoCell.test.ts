/**
 * PixelBentoCell beyond the parity examples: the deprecated `kind` alias,
 * the tone chrome and surface inheritance.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelBentoCell, PxlKitSurfaceProvider } from '../../index';

describe('PixelBentoCell', () => {
  it('prefers variant over the deprecated kind alias and marks its kind and span', async () => {
    const wrapper = mount(PixelBentoCell, { props: { kind: 'stat', span: '3x1' }, attrs: { 'aria-label': 'Uptime' } });
    expect(wrapper.attributes('data-kind')).toBe('stat');
    expect(wrapper.attributes('data-span')).toBe('3x1');
    expect(wrapper.attributes('aria-label')).toBe('Uptime');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['justify-center', 'lg:col-span-3']));
    await wrapper.setProps({ variant: 'media' });
    expect(wrapper.attributes('data-kind')).toBe('media');
    expect(wrapper.classes()).toContain('overflow-hidden');
    await wrapper.setProps({ variant: undefined, kind: undefined });
    expect(wrapper.attributes('data-kind')).toBe('feature');
  });

  it('draws the tone chrome on the surface of the nearest provider when bordered', () => {
    const wrapper = mount(() =>
      h(PxlKitSurfaceProvider, { surface: 'linear' }, () => h(PixelBentoCell, { tone: 'pink', bordered: true })),
    );
    expect(wrapper.find('div').classes()).toEqual(
      expect.arrayContaining(['border', 'rounded-xl', 'border-retro-pink/30', 'bg-retro-pink/18', 'text-retro-pink']),
    );
  });
});
