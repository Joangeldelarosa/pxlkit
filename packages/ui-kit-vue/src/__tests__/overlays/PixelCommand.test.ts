/**
 * PixelCommand: v-model:open and its shortcut, commands run by keyboard and
 * pointer, icons, a changing list of groups and the exposed panel. Rendering
 * and the shared interactions are covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelCommand, type PixelCommandGroup } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const field = () => document.querySelector<HTMLInputElement>('[role="combobox"]')!;
const options = () => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
const key = (key: string, init: KeyboardEventInit = {}, target: EventTarget = window) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

function groupsOf(onSelect: (id: string) => void, ids = ['alpha', 'beta', 'gamma']): PixelCommandGroup[] {
  return [{ heading: 'Commands', items: ids.map((id) => ({ id, label: id, onSelect: () => onSelect(id) })) }];
}

function harness(props: Record<string, unknown> = {}, initial = false) {
  const open = ref(initial);
  const selected: string[] = [];
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(PixelCommand, {
          open: open.value,
          'onUpdate:open': (next: boolean) => (open.value = next),
          groups: groupsOf((id) => selected.push(id)),
          ...props,
        }),
    }),
    { attachTo: document.body },
  );
  return { open, selected, wrapper };
}

// Open palettes hold the page's scroll lock until they unmount.
enableAutoUnmount(afterEach);

describe('PixelCommand', () => {
  it('toggles a v-model:open binding with its shortcut, focusing the search field', async () => {
    const { open } = harness();
    await settle();
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(event);
    await settle();
    expect(event.defaultPrevented).toBe(true);
    expect(open.value).toBe(true);
    expect(document.activeElement).toBe(field());
    key('K', { metaKey: true });
    await settle();
    expect(open.value).toBe(false);
    expect(dialog()).toBeNull();
  });

  it('closes on Escape and on the backdrop', async () => {
    const { open } = harness({}, true);
    await settle();
    key('Escape');
    await settle();
    expect(open.value).toBe(false);
    open.value = true;
    await settle();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(open.value).toBe(false);
  });

  it('asks to toggle without changing while its parent holds open', async () => {
    const wrapper = mount(PixelCommand, { props: { open: false, groups: groupsOf(() => {}) }, attachTo: document.body });
    await settle();
    key('k', { ctrlKey: true });
    await settle();
    expect(wrapper.emitted('update:open')).toEqual([[true]]);
    expect(dialog()).toBeNull();
  });

  it('listens to its own shortcut, and to none when it is empty', async () => {
    const custom = harness({ shortcut: 'alt+/' });
    await settle();
    key('k', { ctrlKey: true });
    await settle();
    expect(custom.open.value).toBe(false);
    key('/', { altKey: true });
    await settle();
    expect(custom.open.value).toBe(true);
    custom.wrapper.unmount();

    const none = harness({ shortcut: '' });
    await settle();
    key('k', { ctrlKey: true });
    await settle();
    expect(none.open.value).toBe(false);
  });

  it('runs the highlighted command on Enter and a clicked one, without closing by itself', async () => {
    const { open, selected } = harness({}, true);
    await settle();
    key('ArrowDown', {}, field());
    key('Enter', {}, field());
    await settle();
    options()[2]!.click();
    await settle();
    expect(selected).toEqual(['beta', 'gamma']);
    expect(open.value).toBe(true);
  });

  it('keeps the highlight on a listed command when the groups shrink', async () => {
    const groups = ref(groupsOf(() => {}));
    mount(() => h(PixelCommand, { open: true, groups: groups.value }), { attachTo: document.body });
    await settle();
    key('End', {}, field());
    await settle();
    expect(options()[2]!.getAttribute('aria-selected')).toBe('true');
    groups.value = groupsOf(() => {}, ['alpha', 'beta']);
    await settle();
    expect(options()[1]!.getAttribute('aria-selected')).toBe('true');
    expect(field().getAttribute('aria-activedescendant')).toBe(options()[1]!.id);
    groups.value = [];
    await settle();
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(field().hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('renders command icons from text, VNodes or render functions', async () => {
    const onSelect = vi.fn();
    mount(
      () =>
        h(PixelCommand, {
          open: true,
          groups: [
            {
              heading: 'Icons',
              items: [
                { id: 'text', label: 'Text', icon: '★', onSelect },
                { id: 'node', label: 'Node', icon: h('svg', { 'data-testid': 'icon' }), onSelect },
                { id: 'fn', label: 'Function', icon: () => h('b', 'fn'), onSelect },
                { id: 'none', label: 'None', onSelect },
              ],
            },
          ],
        }),
      { attachTo: document.body },
    );
    await settle();
    const icons = options().map((option) => option.querySelector('span.shrink-0'));
    expect(icons[0]!.textContent).toBe('★');
    expect(icons[1]!.querySelector('[data-testid="icon"]')).not.toBeNull();
    expect(icons[2]!.innerHTML).toBe('<b>fn</b>');
    expect(icons[3]).toBeNull();
  });

  it('exposes its panel', async () => {
    const palette = ref<{ element: HTMLElement | null } | null>(null);
    mount(() => h(PixelCommand, { ref: palette, open: true, groups: groupsOf(() => {}) }), { attachTo: document.body });
    await settle();
    expect(palette.value?.element).toBe(dialog());
  });

  it('shows what its parent binds: its shortcut, Escape and the backdrop only ask', async () => {
    const requests: boolean[] = [];
    const { open } = harness({ 'onUpdate:open': (next: boolean) => requests.push(next) });
    await settle();
    key('k', { ctrlKey: true });
    key('k', { ctrlKey: true });
    await settle();
    expect(requests).toEqual([true, true]);
    expect(dialog()).toBeNull();
    open.value = true;
    await settle();
    key('Escape');
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(requests).toEqual([true, true, false, false]);
    expect(dialog()).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
  });
});
