/**
 * PixelAvatar behaviour the parity examples cannot trigger: the fallback to
 * the initials when the image fails, and locale-aware initials.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelAvatar, PxlKitLocaleProvider } from '../../index';

describe('PixelAvatar', () => {
  it('falls back to the initials when the image fails, and tries a new src again', async () => {
    const wrapper = mount(PixelAvatar, { props: { name: 'Jane Doe', src: '/broken.png' } });
    await wrapper.find('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('[data-shape]').text()).toBe('JD');

    await wrapper.setProps({ src: '/jane.png' });
    expect(wrapper.find('img').attributes('src')).toBe('/jane.png');
    expect(wrapper.find('img').attributes('alt')).toBe('Jane Doe');
  });

  it('upper-cases the initials for the locale of the nearest provider', () => {
    const wrapper = mount(() => h(PxlKitLocaleProvider, { locale: 'tr' }, () => h(PixelAvatar, { name: 'işıl gündüz' })));
    expect(wrapper.find('[data-shape]').text()).toBe('İG');
  });

  it('makes the frame an image named with the status only while it has one, and passes attributes to the root', async () => {
    const wrapper = mount(PixelAvatar, { props: { name: 'Jane Doe', status: 'busy' }, attrs: { 'data-testid': 'avatar' } });
    expect(wrapper.attributes('data-testid')).toBe('avatar');
    const frame = () => wrapper.find('[data-shape]');
    expect(frame().attributes('role')).toBe('img');
    expect(frame().attributes('aria-label')).toBe('Jane Doe (busy)');
    expect(wrapper.find('[data-status]').attributes('aria-hidden')).toBe('true');
    await wrapper.setProps({ status: undefined });
    expect(frame().attributes('role')).toBeUndefined();
    expect(frame().attributes('aria-label')).toBeUndefined();
  });
});
