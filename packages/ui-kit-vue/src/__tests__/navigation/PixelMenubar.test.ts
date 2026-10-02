/**
 * PixelMenubar beyond the parity examples: item handlers from the pointer and
 * the keyboard, item icons, and the attributes that fall through to the
 * menubar.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import { PixelMenubar, type PixelMenubarMenu } from '../../index';

enableAutoUnmount(afterEach);

function menus(onSave = vi.fn(), onPdf = vi.fn()): PixelMenubarMenu[] {
  return [
    {
      label: 'File',
      items: [
        { value: 'save', label: 'Save', icon: () => h('i', 'S'), onSelect: onSave },
        { value: 'export', label: 'Export', submenu: [{ value: 'pdf', label: 'PDF', onSelect: onPdf }] },
      ],
    },
  ];
}

const key = (name: string) =>
  document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

describe('PixelMenubar', () => {
  it('runs onSelect for an item chosen with the pointer or the keyboard', async () => {
    const onSave = vi.fn();
    const onPdf = vi.fn();
    const wrapper = mount(PixelMenubar, { props: { menus: menus(onSave, onPdf) }, attachTo: document.body });
    await wrapper.find('button').trigger('click');
    await wrapper.find('[role="menu"] [role="menuitem"]').trigger('click');
    expect(onSave).toHaveBeenCalledTimes(1);
    await wrapper.find('button').trigger('click');
    key('ArrowDown');
    key('Enter');
    await wrapper.vm.$nextTick();
    key('Enter');
    await wrapper.vm.$nextTick();
    expect(onPdf).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[role="menu"]').exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.find('button').element);
  });

  it('renders item icons', async () => {
    const wrapper = mount(PixelMenubar, { props: { menus: menus() } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('[role="menuitem"] i').text()).toBe('S');
  });

  it('passes attributes to the menubar', () => {
    const wrapper = mount(PixelMenubar, { props: { menus: menus() }, attrs: { 'aria-label': 'Editor', class: 'w-full' } });
    expect(wrapper.attributes('role')).toBe('menubar');
    expect(wrapper.attributes('aria-label')).toBe('Editor');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['w-full', 'inline-flex']));
  });
});
