/**
 * PixelDropdown: v-model:open on the root, the select events of items and of
 * the shorthand, attributes and listeners on items, own ids, slots, typeahead
 * labels, and focus around a parent that overrules the menu. Rendering and
 * the shared interactions are covered against React by the parity suite.
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
const items = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]'));
const highlighted = () => document.querySelector<HTMLElement>('[data-highlighted="true"]');
const keydown = (key: string) => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
const key = (key: string) => trigger().dispatchEvent(keydown(key));
// A key pressed where focus is: in the open menu.
const press = (key: string) => document.activeElement!.dispatchEvent(keydown(key));

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

  it('opens the closed menu from an arrow key: ArrowDown on its first enabled item, ArrowUp on its last', async () => {
    const open = ref(false);
    mount(
      defineComponent({
        setup: () => () =>
          h(PixelDropdownRoot, { open: open.value, 'onUpdate:open': (next: boolean) => (open.value = next) }, () => [
            h(PixelDropdownTrigger, () => 'Menu'),
            h(PixelDropdownContent, () => [
              h(PixelDropdownItem, { value: 'a', disabled: true }, () => 'Alpha'),
              h(PixelDropdownItem, { value: 'b' }, () => 'Bravo'),
              h(PixelDropdownItem, { value: 'c' }, () => 'Charlie'),
              h(PixelDropdownItem, { value: 'd', disabled: true }, () => 'Delta'),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );
    key('ArrowDown');
    await nextTick();
    await nextTick();
    expect(open.value).toBe(true);
    expect(highlighted()!.textContent).toBe('Bravo');
    expect(document.activeElement).toBe(menu());
    expect(menu()!.getAttribute('aria-activedescendant')).toBe(highlighted()!.id);
    open.value = false;
    await nextTick();
    key('ArrowUp');
    await nextTick();
    await nextTick();
    expect(highlighted()!.textContent).toBe('Charlie');
    expect(menu()!.getAttribute('aria-activedescendant')).toBe(highlighted()!.id);
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
    press('ArrowDown');
    await nextTick();
    press(' ');
    await nextTick();
    expect(document.activeElement).toBe(trigger());
    key('ArrowDown');
    await nextTick();
    await nextTick();
    press('Enter');
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
    expect([item, check, cozy, compact].map((each) => each!.getAttribute('role'))).toEqual([
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'menuitemradio',
    ]);
    expect([item, check, cozy, compact].map((each) => each!.getAttribute('aria-checked'))).toEqual([null, 'true', 'true', 'false']);
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
    await nextTick();
    press('b');
    await nextTick();
    expect(highlighted()!.textContent).toBe('Bright');
  });

  it('names the menu by the trigger and points it at the highlighted item, by their own ids when they have them', async () => {
    mount(PixelDropdownRoot, {
      slots: {
        default: () => [
          h(PixelDropdownTrigger, { id: 'file-menu' }, () => 'File'),
          h(PixelDropdownContent, () => [h(PixelDropdownItem, { id: 'file-new' }, () => 'New'), h(PixelDropdownItem, () => 'Open')]),
        ],
      },
      attachTo: document.body,
    });
    expect(trigger().id).toBe('file-menu');
    trigger().click();
    await nextTick();
    expect(document.activeElement).toBe(menu());
    expect(menu()!.getAttribute('aria-labelledby')).toBe('file-menu');
    expect(menu()!.hasAttribute('aria-activedescendant')).toBe(false);
    press('ArrowDown');
    await nextTick();
    expect(menu()!.getAttribute('aria-activedescendant')).toBe('file-new');
    press('ArrowDown');
    await nextTick();
    expect(menu()!.getAttribute('aria-activedescendant')).toBe(items()[1]!.id);
    expect(items()[1]!.id).not.toBe('');
  });

  it('closes on Tab with focus back on the trigger, leaving the default to the browser', async () => {
    mount(PixelDropdownRoot, { slots: { default: () => parts() }, attachTo: document.body });
    trigger().click();
    await nextTick();
    const tab = keydown('Tab');
    menu()!.dispatchEvent(tab);
    await nextTick();
    expect(tab.defaultPrevented).toBe(false);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('hands focus back once its parent closes it after overruling a press outside', async () => {
    const wrapper = mount(PixelDropdownRoot, { props: { open: true }, slots: { default: () => parts() }, attachTo: document.body });
    await nextTick();
    expect(document.activeElement).toBe(menu());
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await nextTick();
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
    await wrapper.setProps({ open: false });
    expect(document.activeElement).toBe(trigger());
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

  it('shows what its parent binds: the trigger, Escape, a press outside and an item only ask, and it asks again after a refusal', async () => {
    const open = ref(false);
    const requests: boolean[] = [];
    let accept = false;
    mount(
      defineComponent({
        setup: () => () =>
          h(
            PixelDropdownRoot,
            {
              open: open.value,
              'onUpdate:open': (next: boolean) => {
                requests.push(next);
                if (accept) open.value = next;
              },
            },
            () => parts(),
          ),
      }),
      { attachTo: document.body },
    );
    await nextTick();
    trigger().click();
    trigger().click();
    await nextTick();
    expect(requests).toEqual([true, true]);
    expect(menu()).toBeNull();
    accept = true;
    trigger().click();
    await nextTick();
    await nextTick();
    expect(menu()).not.toBeNull();
    accept = false;
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    items()[0]!.click();
    await nextTick();
    expect(requests).toEqual([true, true, true, false, false, false]);
    expect(menu()).not.toBeNull();
  });
});
