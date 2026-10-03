/**
 * PixelSplitButton: the primary and select events, one-way options and
 * disabled state, and synthetic clicks on disabled buttons. Rendering, the
 * keyboard and focus are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { PixelSplitButton } from '../../index';

const OPTIONS = [
  { value: 'csv', label: 'Export CSV' },
  { value: 'json', label: 'Export JSON' },
];
const chevron = () => document.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));

// An open menu keeps page-wide listeners until it unmounts.
enableAutoUnmount(afterEach);

describe('PixelSplitButton', () => {
  it('emits primary from the primary button and select with the value of the chosen option', async () => {
    const wrapper = mount(PixelSplitButton, { props: { label: 'Export', options: OPTIONS }, attachTo: document.body });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('primary')).toEqual([[]]);
    expect(document.querySelector('[role="menu"]')).toBeNull();

    chevron().click();
    await nextTick();
    items()[1]!.click();
    await nextTick();
    expect(wrapper.emitted('select')).toEqual([['json']]);
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(chevron());
  });

  it('chooses the highlighted option with Enter', async () => {
    const wrapper = mount(PixelSplitButton, { props: { label: 'Export', options: OPTIONS }, attachTo: document.body });
    chevron().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    await nextTick();
    const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
    expect(document.activeElement).toBe(menu);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await nextTick();
    expect(wrapper.emitted('select')).toEqual([['json']]);
  });

  it('renders the options it is given', async () => {
    const wrapper = mount(PixelSplitButton, { props: { label: 'Export', options: OPTIONS }, attachTo: document.body });
    chevron().click();
    await nextTick();
    await wrapper.setProps({ options: [...OPTIONS, { value: 'xml', label: 'Export XML' }] });
    expect(items().map((item) => item.textContent?.trim())).toEqual(['Export CSV', 'Export JSON', 'Export XML']);
    expect(wrapper.element.tagName).toBe('DIV');
  });

  it('ignores synthetic clicks while disabled, then works once enabled', async () => {
    const wrapper = mount(PixelSplitButton, {
      props: { label: 'Export', options: OPTIONS, disabled: true },
      attachTo: document.body,
    });
    const [primary, toggle] = wrapper.findAll('button');
    expect((primary!.element as HTMLButtonElement).disabled).toBe(true);
    expect((toggle!.element as HTMLButtonElement).disabled).toBe(true);
    primary!.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    toggle!.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(wrapper.emitted('primary')).toBeUndefined();
    expect(document.querySelector('[role="menu"]')).toBeNull();

    await wrapper.setProps({ disabled: false });
    chevron().click();
    await nextTick();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('stops its typeahead timer when it unmounts', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const wrapper = mount(PixelSplitButton, { props: { label: 'Export', options: OPTIONS }, attachTo: document.body });
      chevron().click();
      await nextTick();
      const pending = vi.getTimerCount();
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', bubbles: true }));
      await nextTick();
      expect(items()[1]!.getAttribute('data-highlighted')).toBe('true');
      expect(vi.getTimerCount()).toBe(pending + 1);
      wrapper.unmount();
      expect(vi.getTimerCount()).toBe(pending);
    } finally {
      vi.useRealTimers();
    }
  });
});
