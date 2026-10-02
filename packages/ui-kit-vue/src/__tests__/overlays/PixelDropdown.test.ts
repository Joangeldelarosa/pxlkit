/**
 * PixelDropdown: v-model:open on the root, the select events of items and of
 * the shorthand, attributes and listeners on items, slots, and typeahead
 * labels. Rendering and the shared interactions are covered against React by
 * the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  PixelDropdown,
  PixelDropdownCheckboxItem,
  PixelDropdownContent,
  PixelDropdownItem,
  PixelDropdownRadioItem,
  PixelDropdownRoot,
  PixelDropdownTrigger,
} from '../../index';

const trigger = () => document.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!;
const menu = () => document.querySelector<HTMLElement>('[role="menu"]');
const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
const highlighted = () => document.querySelector<HTMLElement>('[data-highlighted="true"]');
const key = (key: string) => trigger().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

const parts = (onSelect: (value: string) => void = () => {}) => [
  h(PixelDropdownTrigger, () => 'Menu'),
  h(PixelDropdownContent, () => [
    h(PixelDropdownItem, { value: 'copy', onSelect: () => onSelect('copy') }, () => 'Copy'),
    h(PixelDropdownItem, { value: 'cut', disabled: true, onSelect: () => onSelect('cut') }, () => 'Cut'),
    h(PixelDropdownItem, { value: 'paste', onSelect: () => onSelect('paste') }, () => 'Paste'),
  ]),
];

// Mounted menus keep page-wide listeners until they unmount.
enableAutoUnmount(afterEach);

describe('PixelDropdown', () => {
  it('toggles a v-model:open binding from the trigger and advertises the menu', async () => {
    const open = ref(false);
    mount(
      defineComponent({
        setup: () => () =>
          h(PixelDropdownRoot, { open: open.value, 'onUpdate:open': (next: boolean) => (open.value = next) }, () => parts()),
      }),
      { attachTo: document.body },
    );
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
    trigger().click();
    await nextTick();
    expect(open.value).toBe(true);
    expect(trigger().getAttribute('aria-controls')).toBe(menu()!.id);
    trigger().click();
    await nextTick();
    expect(open.value).toBe(false);
    expect(menu()).toBeNull();
  });

  it('opens the closed menu on its first enabled item from an arrow key', async () => {
    const open = ref(false);
    mount(
      defineComponent({
        setup: () => () =>
          h(PixelDropdownRoot, { open: open.value, 'onUpdate:open': (next: boolean) => (open.value = next) }, () => [
            h(PixelDropdownTrigger, () => 'Menu'),
            h(PixelDropdownContent, () => [
              h(PixelDropdownItem, { value: 'a', disabled: true }, () => 'Alpha'),
              h(PixelDropdownItem, { value: 'b' }, () => 'Bravo'),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );
    key('ArrowUp');
    await nextTick();
    await nextTick();
    expect(open.value).toBe(true);
    expect(highlighted()!.textContent).toBe('Bravo');
  });

  it('asks to open without opening while its parent holds it closed, and drops the arrow request', async () => {
    const wrapper = mount(PixelDropdownRoot, { props: { open: false }, slots: { default: () => parts() }, attachTo: document.body });
    trigger().click();
    key('ArrowDown');
    await nextTick();
    expect(wrapper.emitted('update:open')).toEqual([[true], [true]]);
    expect(menu()).toBeNull();
    await wrapper.setProps({ open: true });
    await nextTick();
    expect(menu()).not.toBeNull();
    expect(highlighted()).toBeNull();
  });

  it('starts open from default-open while uncontrolled and closes on Escape and on a press outside', async () => {
    const wrapper = mount(PixelDropdownRoot, { props: { defaultOpen: true }, slots: { default: () => parts() }, attachTo: document.body });
    expect(menu()).not.toBeNull();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(menu()).toBeNull();
    trigger().click();
    await nextTick();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(menu()).toBeNull();
    expect(wrapper.emitted('update:open')!.map(([open]) => open)).toEqual([false, true, false]);
  });

  it('emits select from a click and from Enter or Space on the highlighted item, never from a disabled one', async () => {
    const selected: string[] = [];
    mount(PixelDropdownRoot, { slots: { default: () => parts((value) => selected.push(value)) }, attachTo: document.body });
    trigger().click();
    await nextTick();
    items()[1]!.click();
    items()[1]!.dispatchEvent(new MouseEvent('mouseenter'));
    await nextTick();
    expect(menu()).not.toBeNull();
    expect(highlighted()).toBeNull();
    items()[0]!.click();
    await nextTick();
    expect(menu()).toBeNull();
    key('ArrowDown');
    await nextTick();
    await nextTick();
    key('ArrowDown');
    await nextTick();
    key(' ');
    await nextTick();
    key('ArrowDown');
    await nextTick();
    await nextTick();
    key('Enter');
    await nextTick();
    expect(selected).toEqual(['copy', 'paste', 'copy']);
  });

  it('passes attributes and listeners through to the item buttons', async () => {
    const onClick = vi.fn();
    mount(PixelDropdownRoot, {
      props: { defaultOpen: true },
      slots: {
        default: () => [
          h(PixelDropdownTrigger, () => 'Menu'),
          h(PixelDropdownContent, () => [
            h(
              PixelDropdownItem,
              { value: 'copy', class: 'extra', 'data-testid': 'item', 'aria-keyshortcuts': 'Meta+C', onClick },
              () => 'Copy',
            ),
            h(PixelDropdownCheckboxItem, { value: 'grid', checked: true, 'data-testid': 'check' }, () => 'Grid'),
            h(PixelDropdownRadioItem, { value: 'cozy', checked: true }, () => 'Cozy'),
            h(PixelDropdownRadioItem, { value: 'compact' }, () => 'Compact'),
          ]),
        ],
      },
      attachTo: document.body,
    });
    const [item, check, cozy, compact] = items();
    expect(item!.getAttribute('data-testid')).toBe('item');
    expect(item!.getAttribute('aria-keyshortcuts')).toBe('Meta+C');
    expect(item!.classList).toContain('extra');
    expect(item!.classList).toContain('items-center');
    expect(check!.getAttribute('data-testid')).toBe('check');
    expect(check!.querySelector('[aria-hidden="true"]')!.textContent).toBe('✓');
    expect(cozy!.querySelector('[aria-hidden="true"]')!.textContent).toBe('●');
    expect(compact!.querySelector('[aria-hidden="true"]')!.textContent).toBe('');
    item!.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('jumps by typing only to items whose label is text', async () => {
    mount(PixelDropdownRoot, {
      props: { defaultOpen: true },
      slots: {
        default: () => [
          h(PixelDropdownTrigger, () => 'Menu'),
          h(PixelDropdownContent, () => [
            h(PixelDropdownItem, { value: 'bold' }, () => h('b', 'Bold')),
            h(PixelDropdownItem, { value: 'bright' }, () => 'Bright'),
          ]),
        ],
      },
      attachTo: document.body,
    });
    key('b');
    await nextTick();
    expect(highlighted()!.textContent).toBe('Bright');
  });

  it('emits the value of a row of the shorthand and takes a trigger icon and item icons', async () => {
    const wrapper = mount(PixelDropdown, {
      props: {
        label: 'Actions',
        items: [
          { value: 'edit', label: 'Edit', icon: () => h('i', { 'data-testid': 'icon' }) },
          { value: 'more', label: 'More', kind: 'submenu' },
        ],
      },
      slots: { icon: () => h('span', { 'data-testid': 'trigger-icon' }) },
      attachTo: document.body,
    });
    expect(trigger().querySelector('[data-testid="trigger-icon"]')).not.toBeNull();
    expect(trigger().querySelector('svg')).toBeNull();
    trigger().click();
    await nextTick();
    expect(items()[0]!.querySelector('[data-testid="icon"]')).not.toBeNull();
    expect(items()[1]!.textContent).toContain('▸');
    items()[1]!.click();
    await nextTick();
    expect(wrapper.emitted('select')).toEqual([['more']]);
  });

  it('renders its default slot in place of the shorthand', async () => {
    mount(PixelDropdown, { props: { label: 'Unused', items: [{ value: 'x', label: 'X' }] }, slots: { default: () => parts() }, attachTo: document.body });
    expect(trigger().textContent).toBe('Menu');
    expect(trigger().parentElement!.className).toBe('contents');
  });

  it('explains when a part is used outside a root', () => {
    expect(() => mount(PixelDropdownTrigger)).toThrow('PixelDropdownTrigger must be used inside a <PixelDropdownRoot>');
  });
});
