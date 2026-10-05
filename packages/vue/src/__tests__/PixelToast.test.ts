import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { PixelToast } from '../index';
import { testIcon } from './fixtures';

describe('PixelToast (Vue)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing while hidden', () => {
    const wrapper = mount(PixelToast, { props: { visible: false, title: 'Test' } });
    expect(wrapper.find('div').exists()).toBe(false);
  });

  it('renders the title and optional message', () => {
    const wrapper = mount(PixelToast, { props: { visible: true, title: 'Hello Toast', message: 'This is a message' } });
    expect(wrapper.text()).toContain('Hello Toast');
    expect(wrapper.text()).toContain('This is a message');
    expect(mount(PixelToast, { props: { visible: true, title: 'T' } }).findAll('p')).toHaveLength(1);
  });

  it('shows the icon, or an accent dot without one', () => {
    expect(mount(PixelToast, { props: { visible: true, title: 'T', icon: testIcon } }).find('img').exists()).toBe(true);
    const dotted = mount(PixelToast, { props: { visible: true, title: 'T', accentColor: '#123456' } });
    expect(dotted.find('img').exists()).toBe(false);
    expect((dotted.find('.rounded-full').element as HTMLElement).style.boxShadow).toBe('0 0 8px #123456');
  });

  it('renders its icon decorative: the title beside it names the toast', () => {
    const img = mount(PixelToast, { props: { visible: true, title: 'Saved!', icon: testIcon } }).find('img');
    expect(img.attributes('alt')).toBe('');
  });

  it('renders the icon flat in the accent colour when colorfulIcon is false', () => {
    const img = mount(PixelToast, {
      props: { visible: true, title: 'T', icon: testIcon, colorfulIcon: false, accentColor: '#FF00FF', iconSize: 40 },
    }).find('img');
    expect(img.attributes('width')).toBe('40');
    const svg = decodeURIComponent(img.attributes('src')!.replace(/^data:image\/svg\+xml,/, ''));
    expect(svg).toContain('fill="#FF00FF"');
    expect(svg).not.toContain('fill="#FF0000"');
  });

  it('pins every corner and merges consumer classes into the root', () => {
    for (const [position, expected] of [
      ['top-left', 'top-4 left-4'],
      ['top-right', 'top-4 right-4'],
      ['bottom-left', 'bottom-4 left-4'],
      ['bottom-right', 'bottom-4 right-4'],
    ] as const) {
      const root = mount(PixelToast, { props: { visible: true, title: 'T', position } }).element as HTMLElement;
      expect(root.className).toBe(`fixed z-[80] ${expected}`);
    }
    const custom = mount(PixelToast, { props: { visible: true, title: 'T' }, attrs: { class: 'mt-12' } });
    expect((custom.element as HTMLElement).className).toBe('fixed z-[80] top-4 right-4 mt-12');
  });

  it('colours the box from its props', () => {
    const box = mount(PixelToast, {
      props: { visible: true, title: 'T', bgColor: '#000000', borderColor: '#111111', textColor: '#222222' },
    }).element.firstElementChild as HTMLElement;
    expect(box.style.backgroundColor).toBe('rgb(0, 0, 0)');
    expect(box.style.color).toBe('rgb(34, 34, 34)');
    expect(box.style.boxShadow).toContain('#11111155');
  });

  it('has an accessible close button that emits close', async () => {
    const wrapper = mount(PixelToast, { props: { visible: true, title: 'T' } });
    const button = wrapper.get('button[aria-label="Close toast"]');
    expect(button.attributes('type')).toBe('button');
    await button.trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(mount(PixelToast, { props: { visible: true, title: 'T', showClose: false } }).find('button').exists()).toBe(false);
  });

  it('asks to close itself after duration ms', () => {
    const wrapper = mount(PixelToast, { props: { visible: true, title: 'T', duration: 3000 } });
    vi.advanceTimersByTime(2999);
    expect(wrapper.emitted('close')).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('uses the default 2200 ms duration and never auto-closes with duration 0', () => {
    const byDefault = mount(PixelToast, { props: { visible: true, title: 'T' } });
    vi.advanceTimersByTime(2200);
    expect(byDefault.emitted('close')).toHaveLength(1);
    const sticky = mount(PixelToast, { props: { visible: true, title: 'T', duration: 0 } });
    vi.advanceTimersByTime(10_000);
    expect(sticky.emitted('close')).toBeUndefined();
  });

  it('re-arms the timer when it becomes visible again, and cancels it on unmount', async () => {
    const wrapper = mount(PixelToast, { props: { visible: false, title: 'T', duration: 1000 } });
    vi.advanceTimersByTime(5000);
    expect(wrapper.emitted('close')).toBeUndefined();

    await wrapper.setProps({ visible: true });
    vi.advanceTimersByTime(999);
    expect(wrapper.emitted('close')).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('close')).toHaveLength(1);

    await wrapper.setProps({ visible: false });
    await wrapper.setProps({ visible: true });
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('server-renders without leaving a timer behind', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(PixelToast, { visible: true, title: 'Saved!', duration: 5000 }) }),
    );
    expect(html).toContain('Saved!');
    expect(html).toContain('aria-label="Close toast"');
    expect(vi.getTimerCount()).toBe(0);
  });
});
