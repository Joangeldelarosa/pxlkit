/**
 * PixelSheet: v-model:open, its side, size and drag handle, its accessible
 * name and the exposed panel. Rendering and the shared interactions are
 * covered against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelSheet } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const handle = () => document.querySelector<HTMLElement>('[data-testid="pixel-sheet-drag-handle"]');
const escape = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

function harness(props: Record<string, unknown> = {}) {
  const open = ref(true);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          PixelSheet,
          { open: open.value, 'onUpdate:open': (next: boolean) => (open.value = next), title: 'Actions', ...props },
          () => h('p', 'body'),
        ),
    }),
    { attachTo: document.body },
  );
  return { open, wrapper };
}

// Open sheets hold the page's scroll lock until they unmount.
enableAutoUnmount(afterEach);

describe('PixelSheet', () => {
  it('closes a v-model:open binding on Escape and on the backdrop', async () => {
    const { open } = harness();
    await settle();
    escape();
    await settle();
    expect(open.value).toBe(false);
    expect(dialog()).toBeNull();
    open.value = true;
    await settle();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(open.value).toBe(false);
  });

  it('reports its side and size and draws the drag handle last on a top sheet', async () => {
    const bottom = harness({ dragHandle: true });
    await settle();
    expect(dialog()!.dataset).toMatchObject({ side: 'bottom', size: 'md' });
    expect(dialog()!.firstElementChild).toBe(handle());
    expect(handle()!.classList).not.toContain('order-last');
    bottom.wrapper.unmount();

    harness({ dragHandle: true, side: 'top', size: 'full' });
    await settle();
    expect(dialog()!.dataset).toMatchObject({ side: 'top', size: 'full' });
    expect(handle()!.classList).toContain('order-last');
  });

  it('is named by its title, or by aria-label, and warns without either', async () => {
    const titled = harness({ description: 'Pick one' });
    await settle();
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.tagName).toBe('H4');
    expect(document.getElementById(dialog()!.getAttribute('aria-describedby')!)!.textContent).toBe('Pick one');
    titled.wrapper.unmount();

    harness({ title: undefined, 'aria-label': 'Top sheet' });
    await settle();
    expect(dialog()!.getAttribute('aria-label')).toBe('Top sheet');
    expect(handle()).toBeNull();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    harness({ title: undefined });
    await settle();
    expect(warn.mock.calls.flat().join(' ')).toContain('[PixelSheet] role="dialog" has no accessible name.');
    warn.mockRestore();
  });

  it('exposes its panel', async () => {
    const sheet = ref<{ element: HTMLElement | null } | null>(null);
    mount(() => h(PixelSheet, { ref: sheet, open: true, title: 'Actions' }), { attachTo: document.body });
    await settle();
    expect(sheet.value?.element).toBe(dialog());
  });

  it('shows what its parent binds: a refused close keeps it open and locking the page, until the parent closes it', async () => {
    const requests: boolean[] = [];
    const { open } = harness({ 'onUpdate:open': (next: boolean) => requests.push(next) });
    await settle();
    escape();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
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
