/**
 * PixelStatCard beyond the parity examples: where each icon position puts the
 * icon slot, the trend line, and attributes.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelStatCard, PxlKitSurfaceProvider } from '../../index';

const icon = () => h('i', 'icon');

describe('PixelStatCard', () => {
  it('puts the icon beside the label on top, after or before the text, or in the bottom-left corner', async () => {
    const wrapper = mount(PixelStatCard, { props: { label: 'Users', value: '12' }, slots: { icon } });
    expect(wrapper.element.firstElementChild!.lastElementChild!.textContent).toBe('icon');

    await wrapper.setProps({ iconPosition: 'right' });
    expect(wrapper.element.lastElementChild!.textContent).toBe('icon');
    expect(wrapper.find('.min-w-0').text()).toBe('Users12');

    await wrapper.setProps({ iconPosition: 'left' });
    expect(wrapper.element.firstElementChild!.textContent).toBe('icon');
    expect(wrapper.find('.min-w-0.flex-1').exists()).toBe(true);

    await wrapper.setProps({ iconPosition: 'bottom-left' });
    const corner = wrapper.element.lastElementChild as HTMLElement;
    expect(corner.textContent).toBe('icon');
    expect(Array.from(corner.classList)).toEqual(expect.arrayContaining(['absolute', 'bottom-0', 'left-0', 'p-4']));
  });

  it('renders the trend line only with a trend, and no icon box without an icon', async () => {
    const wrapper = mount(PixelStatCard, { props: { label: 'Users', value: '12' }, attrs: { 'aria-label': 'Users: 12' } });
    expect(wrapper.findAll('p').map((p) => p.text())).toEqual(['Users', '12']);
    expect(wrapper.find('span').exists()).toBe(false);
    expect(wrapper.attributes('aria-label')).toBe('Users: 12');
    await wrapper.setProps({ trend: '+3%' });
    expect(wrapper.findAll('p').map((p) => p.text())).toEqual(['Users', '12', '+3%']);
  });

  it('sets the value in pixel type on the pixel surface and in the tone when asked', () => {
    const wrapper = mount(() =>
      h(PxlKitSurfaceProvider, { surface: 'linear' }, () => h(PixelStatCard, { label: 'Uptime', value: '99%', tone: 'green', valueTone: true })),
    );
    expect(wrapper.findAll('p')[1]!.classes()).toEqual(['text-retro-green', 'text-base', 'font-semibold']);
    const pixel = mount(PixelStatCard, { props: { label: 'Uptime', value: '99%' } });
    expect(pixel.findAll('p')[1]!.classes()).toEqual(['text-retro-text', 'text-sm', 'font-pixel']);
  });
});
