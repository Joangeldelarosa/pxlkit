/**
 * PixelScrollArea beyond the parity examples: its focusable region defaults
 * and their overrides, the inline style it derives from its props, and the
 * development warning for an unnamed region.
 */
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import { PixelScrollArea, PxlKitSurfaceProvider } from '../../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PixelScrollArea', () => {
  it('is a focusable region whose role and tabindex the consumer can replace', () => {
    const region = mount(PixelScrollArea, { attrs: { 'aria-label': 'Log' } });
    expect(region.attributes()).toMatchObject({ role: 'region', tabindex: '0', 'aria-label': 'Log' });
    const list = mount(PixelScrollArea, { attrs: { 'aria-label': 'Log', role: 'log', tabindex: '-1' } });
    expect(list.attributes()).toMatchObject({ role: 'log', tabindex: '-1' });
  });

  it('derives its inline style and scrollbar marker from its props, next to the consumer style', async () => {
    const wrapper = mount(PixelScrollArea, {
      props: { maxHeight: '50vh', scrollbarSize: 6, offsetScrollbars: true, type: 'scroll' },
      attrs: { 'aria-label': 'Log', style: 'width: 20rem' },
    });
    const style = (wrapper.element as HTMLElement).style;
    expect([style.maxHeight, style.getPropertyValue('--pxl-scrollbar-size'), style.scrollbarGutter, style.width]).toEqual([
      '50vh',
      '6px',
      'stable',
      '20rem',
    ]);
    expect(wrapper.attributes('data-scrollbar')).toBe('scroll');
    await wrapper.setProps({ maxHeight: 200, offsetScrollbars: false, variant: 'hover' });
    expect(style.maxHeight).toBe('200px');
    expect(style.scrollbarGutter).toBe('');
    expect(wrapper.attributes('data-scrollbar')).toBe('hover');
  });

  it('marks the surface of the nearest provider', () => {
    const wrapper = mount(() =>
      h(PxlKitSurfaceProvider, { surface: 'linear' }, () => h(PixelScrollArea, { 'aria-label': 'Log', bordered: true })),
    );
    const region = wrapper.find('[role="region"]');
    expect(region.attributes('data-surface')).toBe('linear');
    expect(region.classes()).toEqual(expect.arrayContaining(['pxl-scroll-linear', 'border', 'rounded-md']));
  });

  it('warns in development about a focusable region without an accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mount(PixelScrollArea);
    expect(warn.mock.calls.flat().join(' ')).toContain('[PixelScrollArea] missing aria-label / aria-labelledby');
    warn.mockClear();
    mount(PixelScrollArea, { attrs: { 'aria-labelledby': 'log-title' } });
    mount(PixelScrollArea, { attrs: { tabindex: '-1' } });
    expect(warn).not.toHaveBeenCalled();
  });
});
