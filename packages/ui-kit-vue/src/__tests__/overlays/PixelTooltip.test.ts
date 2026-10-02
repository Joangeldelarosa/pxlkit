/**
 * PixelTooltip: v-model:open and the uncontrolled default, the delays of each
 * trigger, click dismissal, the content slot and the exposed wrapper.
 * Rendering and the shared interactions are covered against React by the
 * parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelTooltip } from '../../index';

const tooltip = () => document.querySelector<HTMLElement>('[role="tooltip"]');
const wrapperOf = () => document.querySelector<HTMLElement>('span.relative')!;
const advance = async (ms: number) => {
  vi.advanceTimersByTime(ms);
  await nextTick();
  await nextTick();
};

function harness(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  const open = ref<boolean | undefined>(false);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          PixelTooltip,
          { open: open.value, 'onUpdate:open': (next: boolean) => (open.value = next), label: 'Tip', ...props },
          { default: () => h('button', { type: 'button' }, 'trigger'), ...slots },
        ),
    }),
    { attachTo: document.body },
  );
  return { open, wrapper };
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});
enableAutoUnmount(afterEach);

describe('PixelTooltip', () => {
  it('opens a v-model:open binding after the hover delay and closes it after the leave delay', async () => {
    const { open } = harness();
    await nextTick();
    wrapperOf().dispatchEvent(new MouseEvent('mouseenter'));
    await advance(150);
    expect(open.value).toBe(false);
    await advance(100);
    expect(open.value).toBe(true);
    expect(tooltip()!.textContent).toBe('Tip');
    expect(wrapperOf().getAttribute('aria-describedby')).toBe(tooltip()!.id);
    wrapperOf().dispatchEvent(new MouseEvent('mouseleave'));
    await advance(50);
    expect(open.value).toBe(true);
    await advance(100);
    expect(open.value).toBe(false);
    expect(tooltip()).toBeNull();
    expect(wrapperOf().hasAttribute('aria-describedby')).toBe(false);
  });

  it('asks to open without opening while its parent holds it closed', async () => {
    const wrapper = mount(PixelTooltip, {
      props: { open: false, label: 'Tip', delay: 0 },
      slots: { default: () => h('button', { type: 'button' }, 'trigger') },
      attachTo: document.body,
    });
    wrapperOf().dispatchEvent(new MouseEvent('mouseenter'));
    await nextTick();
    expect(wrapper.emitted('update:open')).toEqual([[true]]);
    expect(tooltip()).toBeNull();
  });

  it('starts from defaultOpen while uncontrolled and reports every change', async () => {
    const wrapper = mount(PixelTooltip, {
      props: { defaultOpen: true, trigger: 'click', label: 'Tip' },
      slots: { default: () => h('button', { type: 'button' }, 'trigger') },
      attachTo: document.body,
    });
    await nextTick();
    expect(tooltip()).not.toBeNull();
    wrapperOf().querySelector('button')!.click();
    await nextTick();
    expect(tooltip()).toBeNull();
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('opens on focus for hover and focus triggers, and only on focus for the focus trigger', async () => {
    const focusOnly = harness({ trigger: 'focus', delay: 0 });
    wrapperOf().dispatchEvent(new MouseEvent('mouseenter'));
    await nextTick();
    expect(focusOnly.open.value).toBe(false);
    wrapperOf().querySelector('button')!.focus();
    await nextTick();
    expect(focusOnly.open.value).toBe(true);
    wrapperOf().querySelector('button')!.blur();
    await advance(100);
    expect(focusOnly.open.value).toBe(false);
  });

  it('toggles a click tooltip and closes it on Escape and on a press outside, not inside', async () => {
    const { open } = harness({ trigger: 'click' });
    const button = wrapperOf().querySelector('button')!;
    button.click();
    await nextTick();
    expect(open.value).toBe(true);
    tooltip()!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(open.value).toBe(true);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(open.value).toBe(false);
    button.click();
    await nextTick();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(open.value).toBe(false);
  });

  it('leaves a hover tooltip open on Escape and on a press outside', async () => {
    const { open } = harness({ delay: 0 });
    wrapperOf().dispatchEvent(new MouseEvent('mouseenter'));
    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(open.value).toBe(true);
  });

  it('renders the content slot in place of the label, and nothing without either', async () => {
    const rich = harness({ open: true }, { content: () => h('b', 'rich') });
    await nextTick();
    expect(tooltip()!.innerHTML).toBe('<b>rich</b>');
    rich.wrapper.unmount();
    mount(PixelTooltip, { props: { open: true }, slots: { default: () => 'trigger' }, attachTo: document.body });
    await nextTick();
    expect(tooltip()).toBeNull();
  });

  it('drops a pending open when it unmounts', async () => {
    const { open, wrapper } = harness();
    wrapperOf().dispatchEvent(new MouseEvent('mouseenter'));
    wrapper.unmount();
    await advance(300);
    expect(open.value).toBe(false);
  });

  it('exposes the wrapper around its trigger', async () => {
    const instance = ref<{ element: HTMLElement | null } | null>(null);
    mount(() => h(PixelTooltip, { ref: instance, label: 'Tip' }, () => 'trigger'), { attachTo: document.body });
    await nextTick();
    expect(instance.value?.element).toBe(wrapperOf());
  });
});
