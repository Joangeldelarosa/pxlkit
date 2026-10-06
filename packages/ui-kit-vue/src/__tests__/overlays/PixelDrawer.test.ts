/**
 * PixelDrawer: v-model:open, the dismissal and focus options, its accessible
 * name, the container, the exposed panel and its header / body / footer
 * parts. Rendering and the shared interactions are covered against React by
 * the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelDrawer, PixelDrawerBody, PixelDrawerFooter, PixelDrawerHeader, PxlKitSurfaceProvider } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const backdrop = () => document.querySelector<HTMLElement>('[data-pxl-drawer-overlay]');
const escape = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

function harness(props: Record<string, unknown> = {}) {
  const open = ref(true);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          PixelDrawer,
          { open: open.value, 'onUpdate:open': (next: boolean) => (open.value = next), title: 'Settings', ...props },
          () => h('button', { type: 'button' }, 'inside'),
        ),
    }),
    { attachTo: document.body },
  );
  return { open, wrapper };
}

// Open drawers hold the page's scroll lock until they unmount.
enableAutoUnmount(afterEach);

describe('PixelDrawer', () => {
  it('closes a v-model:open binding on Escape and on the backdrop', async () => {
    const { open } = harness();
    await settle();
    escape();
    await settle();
    expect(open.value).toBe(false);
    expect(dialog()).toBeNull();
    open.value = true;
    await settle();
    backdrop()!.click();
    await settle();
    expect(open.value).toBe(false);
  });

  it('keeps open on a backdrop click with dismissOnOverlay off, and drops the backdrop with overlay off', async () => {
    const { open, wrapper } = harness({ dismissOnOverlay: false });
    await settle();
    backdrop()!.click();
    await settle();
    expect(open.value).toBe(true);
    wrapper.unmount();
    harness({ overlay: false });
    await settle();
    expect(dialog()).not.toBeNull();
    expect(backdrop()).toBeNull();
  });

  it('moves focus inside unless trapFocus is off', async () => {
    const outside = document.body.appendChild(document.createElement('button'));
    outside.focus();
    const trapped = harness();
    await settle();
    expect(document.activeElement!.textContent).toBe('inside');
    trapped.wrapper.unmount();
    outside.focus();
    harness({ trapFocus: false });
    await settle();
    expect(document.activeElement).toBe(outside);
  });

  it('is named by its title and description, or by aria-label, and warns without either', async () => {
    const titled = harness({ description: 'Pick one' });
    await settle();
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent).toBe('Settings');
    expect(document.getElementById(dialog()!.getAttribute('aria-describedby')!)!.textContent).toBe('Pick one');
    expect(dialog()!.hasAttribute('aria-label')).toBe(false);
    titled.wrapper.unmount();

    harness({ title: undefined, 'aria-label': 'Navigation' });
    await settle();
    expect(dialog()!.getAttribute('aria-label')).toBe('Navigation');
    expect(dialog()!.hasAttribute('aria-labelledby')).toBe(false);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    harness({ title: undefined });
    await settle();
    expect(warn.mock.calls.flat().join(' ')).toContain('[PixelDrawer] role="dialog" has no accessible name.');
    warn.mockRestore();
  });

  it('renders into a given container and exposes its panel', async () => {
    const container = document.body.appendChild(document.createElement('section'));
    const drawer = ref<{ element: HTMLElement | null } | null>(null);
    mount(() => h(PixelDrawer, { ref: drawer, open: true, title: 'Settings', container }), { attachTo: document.body });
    await settle();
    expect(container.contains(dialog())).toBe(true);
    expect(drawer.value?.element).toBe(dialog());
  });

  it('draws its header and footer for their own surface and merges classes into its parts', async () => {
    mount(
      () =>
        h(PxlKitSurfaceProvider, { surface: 'linear' }, () =>
          h(PixelDrawer, { open: true, title: 'Settings', surface: 'pixel' }, () => [
            h(PixelDrawerHeader, { class: 'extra' }, () => 'Header'),
            h(PixelDrawerBody, { 'data-testid': 'body' }, () => 'Body'),
            h(PixelDrawerFooter, { surface: 'pixel' }, () => 'Footer'),
          ]),
        ),
      { attachTo: document.body },
    );
    await settle();
    const [, header, body, footer] = Array.from(dialog()!.children) as HTMLElement[];
    // The parts read the provider's surface (or their own), not the drawer's.
    expect(header!.className).toContain('border-b border-retro-border');
    expect(header!.className).not.toContain('border-b-2');
    expect(header!.classList).toContain('extra');
    expect(body!.getAttribute('data-testid')).toBe('body');
    expect(footer!.className).toContain('border-t-2');
  });

  it('shows what its parent binds: a refused close keeps it open and locking the page, until the parent closes it', async () => {
    const requests: boolean[] = [];
    const { open } = harness({ 'onUpdate:open': (next: boolean) => requests.push(next) });
    await settle();
    escape();
    backdrop()!.click();
    await settle();
    expect(requests).toEqual([false, false]);
    expect(dialog()).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    open.value = false;
    await settle();
    expect(dialog()).toBeNull();
    open.value = true;
    await settle();
    expect(dialog()).not.toBeNull();
  });
});
