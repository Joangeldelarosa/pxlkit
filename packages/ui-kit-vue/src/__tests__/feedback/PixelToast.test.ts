/**
 * PixelToast: the dismiss event, the auto-dismiss countdown and what holds
 * it, and the content its toast carries as text, VNodes or render functions.
 * Rendering is covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { PixelToast, type ToastItem } from '../../index';

enableAutoUnmount(afterEach);

const bar = (card: Element) => card.querySelector<HTMLElement>('[aria-hidden="true"] > div')!;

function mountToast(toast: Partial<ToastItem>) {
  return mount(PixelToast, { props: { toast: { id: 't', title: 'Saved', ...toast } }, attachTo: document.body });
}

describe('PixelToast', () => {
  it('emits dismiss from its button and leaves its removal to the owner', async () => {
    const wrapper = mountToast({ duration: 0 });
    await wrapper.get('button[aria-label="Dismiss notification"]').trigger('click');
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
    expect(document.body.contains(wrapper.element)).toBe(true);
  });

  it('announces politely, or assertively for critical tones and assertive toasts', () => {
    expect(mountToast({}).attributes()).toMatchObject({ role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
    expect(mountToast({ tone: 'gold' }).attributes()).toMatchObject({ role: 'alert', 'aria-live': 'assertive' });
    expect(mountToast({ assertive: true }).attributes('role')).toBe('alert');
    expect(mountToast({ tone: 'red', assertive: false }).attributes('role')).toBe('status');
  });

  it('renders text, VNodes and render functions, the animated icon winning over the icon', () => {
    const wrapper = mountToast({
      icon: 'plain icon',
      animatedIcon: h('i', { 'data-testid': 'animated' }),
      action: () => h('button', { type: 'button' }, 'Undo'),
    });
    expect(wrapper.find('[data-pxl-toast-leading] [data-testid="animated"]').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('plain icon');
    expect(wrapper.find('.mt-2\\.5 button').text()).toBe('Undo');
    expect(mountToast({ icon: 'plain icon' }).find('[data-pxl-toast-leading]').text()).toBe('plain icon');
    expect(mountToast({ action: 'See details' }).find('.mt-2\\.5').text()).toBe('See details');
  });

  it('leads with a spinner and shows no countdown while loading', () => {
    const wrapper = mountToast({ loading: true, icon: 'plain icon', duration: 4500 });
    expect(wrapper.find('[data-pxl-toast-leading] [role="presentation"].animate-spin').exists()).toBe(true);
    expect(wrapper.attributes('data-loading')).toBe('true');
    expect(wrapper.find('.h-0\\.5').exists()).toBe(false);
  });

  it('renders the countdown bar full on the server', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(PixelToast, { toast: { id: 't', title: 'Saved', duration: 4500 } }) }),
    );
    expect(html).toContain('style="width:100%;transition-duration:0ms;"');
  });
});

describe('PixelToast — auto-dismiss countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dismisses once its duration has passed, shrinking its bar meanwhile', async () => {
    const wrapper = mountToast({ duration: 1000 });
    await nextTick();
    expect(bar(wrapper.element).style.width).toBe('0%');
    expect(bar(wrapper.element).style.transitionDuration).toBe('1000ms');
    vi.advanceTimersByTime(999);
    expect(wrapper.emitted('dismiss')).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('holds still until both the pointer and focus have left, losing no time meanwhile', async () => {
    const wrapper = mountToast({ duration: 4500, action: () => h('button', { type: 'button' }, 'Undo') });
    await nextTick();
    const undo = wrapper.get('.mt-2\\.5 button').element as HTMLButtonElement;
    vi.advanceTimersByTime(1000);
    await wrapper.trigger('mouseenter');
    vi.advanceTimersByTime(2000);
    undo.focus();
    await nextTick();
    vi.advanceTimersByTime(5000);
    await wrapper.trigger('mouseleave');
    vi.advanceTimersByTime(10_000);
    expect(wrapper.emitted('dismiss')).toBeUndefined();
    expect(bar(wrapper.element).style.width).toBe(`${(3500 / 4500) * 100}%`);

    undo.blur();
    await nextTick();
    expect(bar(wrapper.element).style.transitionDuration).toBe('3500ms');
    vi.advanceTimersByTime(3499);
    expect(wrapper.emitted('dismiss')).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('runs on when the pointer leaves after the focused element is gone', async () => {
    const wrapper = mountToast({ duration: 1000 });
    await nextTick();
    await wrapper.trigger('mouseenter');
    (wrapper.get('button').element as HTMLButtonElement).focus();
    (wrapper.get('button').element as HTMLButtonElement).blur();
    await wrapper.trigger('focusin');
    await wrapper.trigger('mouseleave');
    vi.advanceTimersByTime(1000);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('counts down the new duration once a loading toast settles, held if hovered meanwhile', async () => {
    const wrapper = mountToast({ title: 'Saving…', loading: true });
    await nextTick();
    await wrapper.trigger('mouseenter');
    await wrapper.setProps({ toast: { id: 't', title: 'Saved', tone: 'green', loading: false, duration: 1000 } });
    expect(bar(wrapper.element).style.width).toBe('100%');
    vi.advanceTimersByTime(5000);
    expect(wrapper.emitted('dismiss')).toBeUndefined();
    await wrapper.trigger('mouseleave');
    expect(bar(wrapper.element).style.transitionDuration).toBe('1000ms');
    vi.advanceTimersByTime(1000);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('stops its timer when unmounted', async () => {
    const wrapper = mountToast({ duration: 1000 });
    await nextTick();
    const emitted = wrapper.emitted();
    wrapper.unmount();
    vi.advanceTimersByTime(2000);
    expect(emitted.dismiss).toBeUndefined();
  });
});
