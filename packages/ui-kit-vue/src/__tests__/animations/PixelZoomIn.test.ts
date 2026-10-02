/**
 * PixelZoomIn: its starting scale, and a hover trigger that focus and clicks
 * inside leave alone. The manifest examples are covered against React by
 * the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h } from 'vue';
import { PixelZoomIn } from '../../index';

enableAutoUnmount(afterEach);

describe('PixelZoomIn', () => {
  it('zooms in from its starting scale', () => {
    const wrapper = mount(PixelZoomIn, { props: { startScale: 0.6, duration: 500 } });
    const style = (wrapper.element as HTMLElement).style;
    expect(style.animation).toBe('pxl-zoom-in 500ms cubic-bezier(.2,.9,.2,1) 0ms 1 both');
    expect(style.getPropertyValue('--pxl-zoom-start')).toBe('0.6');
  });

  it('plays while hovered only: focus and clicks inside do not start it', async () => {
    const wrapper = mount(PixelZoomIn, {
      props: { trigger: 'hover' },
      slots: { default: () => h('button', { type: 'button' }, 'Hover me') },
      attachTo: document.body,
    });
    const style = (wrapper.element as HTMLElement).style;
    await wrapper.get('button').trigger('focusin');
    await wrapper.get('button').trigger('click');
    expect(style.animation).toBe('');
    await wrapper.trigger('mouseenter');
    expect(style.animation).toContain('pxl-zoom-in');
    await wrapper.trigger('mouseleave');
    expect(style.animation).toBe('');
  });
});
