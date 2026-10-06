/**
 * PixelAlert: the label and its deprecated `title` alias, the `live`
 * override and the icon / action slots. Rendering is covered against React by
 * the parity suite.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelAlert } from '../../index';

describe('PixelAlert', () => {
  it('shows the label, falling back to the deprecated title', () => {
    expect(mount(PixelAlert, { props: { label: 'Canonical', title: 'Old', message: 'm' } }).text()).toContain('Canonical');
    expect(mount(PixelAlert, { props: { label: 'Canonical', title: 'Old', message: 'm' } }).text()).not.toContain('Old');
    expect(mount(PixelAlert, { props: { title: 'Legacy', message: 'm' } }).text()).toContain('Legacy');
  });

  it('interrupts for critical tones, waits for the others, and follows live', () => {
    expect(mount(PixelAlert, { props: { message: 'm' } }).attributes('aria-live')).toBe('assertive');
    expect(mount(PixelAlert, { props: { message: 'm', tone: 'cyan' } }).attributes('aria-live')).toBe('polite');
    expect(mount(PixelAlert, { props: { message: 'm', tone: 'red', live: 'off' } }).attributes('aria-live')).toBe('off');
    expect(mount(PixelAlert, { props: { message: 'm' } }).attributes('role')).toBe('alert');
  });

  it('renders the icon and action slots only when given', () => {
    const bare = mount(PixelAlert, { props: { message: 'm' } });
    expect(bare.find('.mt-3').exists()).toBe(false);
    expect(bare.find('.mt-0\\.5').exists()).toBe(false);
    const full = mount(PixelAlert, {
      props: { message: 'm' },
      slots: { icon: () => h('svg', { 'data-testid': 'icon' }), action: () => h('button', 'Retry') },
    });
    expect(full.find('[data-testid="icon"]').exists()).toBe(true);
    expect(full.find('.mt-3 button').text()).toBe('Retry');
  });

  it('draws the accent stripe on the pixel surface only', () => {
    expect(mount(PixelAlert, { props: { message: 'm' } }).find('span[aria-hidden="true"].w-1').exists()).toBe(true);
    expect(mount(PixelAlert, { props: { message: 'm', surface: 'linear' } }).find('.w-1').exists()).toBe(false);
  });
});
