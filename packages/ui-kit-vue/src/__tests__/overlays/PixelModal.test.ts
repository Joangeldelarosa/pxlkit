/**
 * PixelModal: v-model:open and the close event, async close, slots and the
 * page effects. Rendering and the shared interactions are covered against
 * React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelModal } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const closeButton = () => dialog()!.querySelector<HTMLButtonElement>('button[aria-label]')!;
const escape = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

function harness(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  const open = ref(true);
  const onClose = vi.fn();
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          PixelModal,
          {
            open: open.value,
            'onUpdate:open': (next: boolean) => (open.value = next),
            onClose,
            title: 'Title',
            ...props,
          },
          { default: () => h('p', 'body'), ...slots },
        ),
    }),
    { attachTo: document.body },
  );
  return { open, onClose, wrapper };
}

// Open modals hold the page's scroll lock until they unmount (the shared
// setup clears the page afterwards).
enableAutoUnmount(afterEach);

describe('PixelModal', () => {
  it('closes a v-model:open binding and emits close from the button, Escape and the backdrop', async () => {
    const { open, onClose } = harness();
    await settle();
    closeButton().click();
    await settle();
    expect(open.value).toBe(false);
    expect(dialog()).toBeNull();
    open.value = true;
    await settle();
    escape();
    await settle();
    expect(open.value).toBe(false);
    open.value = true;
    await settle();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(open.value).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('stays open while its parent keeps open true', async () => {
    const wrapper = mount(PixelModal, { props: { open: true, title: 'Title' }, attachTo: document.body });
    await settle();
    closeButton().click();
    await settle();
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
    expect(dialog()).not.toBeNull();
  });

  it('awaits asyncClose with a busy close button, ignoring Escape and the backdrop meanwhile', async () => {
    let finish!: () => void;
    const asyncClose = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { open, onClose } = harness({ asyncClose });
    await settle();
    closeButton().click();
    await settle();
    expect(closeButton().disabled).toBe(true);
    expect(closeButton().getAttribute('aria-busy')).toBe('true');
    escape();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(asyncClose).toHaveBeenCalledTimes(1);
    expect(open.value).toBe(true);
    finish();
    await settle();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(open.value).toBe(false);
  });

  it('describes the dialog with the description slot and renders the footer slot', async () => {
    harness({}, { description: () => 'Details', footer: () => h('button', { type: 'button' }, 'Save') });
    await settle();
    const description = document.getElementById(dialog()!.getAttribute('aria-describedby')!)!;
    expect(description.textContent).toBe('Details');
    expect(dialog()!.textContent).toContain('Save');
  });

  it('names the dialog with its title, upper-cased', async () => {
    harness({ title: 'Save changes?' });
    await settle();
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent).toBe('SAVE CHANGES?');
  });

  it('locks page scrolling while open and renders into a given container', async () => {
    const container = document.createElement('section');
    document.body.appendChild(container);
    const { open } = harness({ container });
    await settle();
    expect(container.contains(dialog())).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    open.value = false;
    await settle();
    expect(document.body.style.overflow).toBe('');
  });

  it('shows what its parent binds: a refused close keeps it open and locking the page, until the parent closes it', async () => {
    const requests: boolean[] = [];
    const { open, onClose } = harness(
      { 'onUpdate:open': (next: boolean) => requests.push(next) },
      { default: () => h('button', { type: 'button' }, 'inside') },
    );
    await settle();
    closeButton().click();
    escape();
    document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!.click();
    await settle();
    expect(requests).toEqual([false, false, false]);
    expect(onClose).toHaveBeenCalledTimes(3);
    expect(dialog()).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    open.value = false;
    await settle();
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).toBe('');
    open.value = true;
    await settle();
    expect(dialog()).not.toBeNull();
  });
});
