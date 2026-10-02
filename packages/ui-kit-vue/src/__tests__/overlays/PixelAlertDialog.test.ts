/**
 * PixelAlertDialog: v-model:open, the action and error callbacks (sync,
 * async, thrown, rejected), the pending state, the linear layout and the
 * exposed panel. Rendering and the shared interactions are covered against
 * React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { PixelAlertDialog } from '../../index';

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const dialog = () => document.querySelector<HTMLElement>('[role="alertdialog"]');
const buttons = () => Array.from(dialog()!.querySelectorAll<HTMLButtonElement>(':scope button'));
const escape = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
const backdrop = () => document.querySelector<HTMLElement>('[data-pxl-overlay-backdrop]')!;

function harness(props: Record<string, unknown> = {}) {
  const open = ref(true);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(PixelAlertDialog, {
          open: open.value,
          'onUpdate:open': (next: boolean) => (open.value = next),
          title: 'Delete file?',
          onAction: () => {},
          ...props,
        }),
    }),
    { attachTo: document.body },
  );
  return { open, wrapper };
}

// Open dialogs hold the page's scroll lock until they unmount.
enableAutoUnmount(afterEach);

describe('PixelAlertDialog', () => {
  it('closes a v-model:open binding from Cancel, Escape and the backdrop', async () => {
    const { open } = harness();
    await settle();
    buttons()[0]!.click();
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
    backdrop().click();
    await settle();
    expect(open.value).toBe(false);
  });

  it('stays open while its parent keeps open true', async () => {
    const wrapper = mount(PixelAlertDialog, {
      props: { open: true, title: 'Confirm', onAction: () => {} },
      attachTo: document.body,
    });
    await settle();
    buttons()[0]!.click();
    await settle();
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
    expect(dialog()).not.toBeNull();
  });

  it('starts with focus on Cancel and labels its buttons', async () => {
    harness({ cancelLabel: 'Keep', actionLabel: 'Delete' });
    await settle();
    expect(buttons().map((button) => button.textContent!.trim())).toEqual(['Keep', 'Delete']);
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('closes after a synchronous action', async () => {
    const onAction = vi.fn();
    const { open } = harness({ onAction });
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(open.value).toBe(false);
  });

  it('stays open and busy until an async action resolves, ignoring every way out meanwhile', async () => {
    let finish!: () => void;
    const onAction = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { open } = harness({ onAction });
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(buttons().every((button) => button.disabled)).toBe(true);
    expect(buttons()[1]!.querySelector('span[aria-hidden="true"]')).not.toBeNull();
    escape();
    backdrop().click();
    buttons()[1]!.click();
    await settle();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(open.value).toBe(true);
    finish();
    await settle();
    expect(open.value).toBe(false);
  });

  it('hands a thrown or rejected error to @error and stays open', async () => {
    const onError = vi.fn();
    const failure = new Error('nope');
    const thrown = harness({
      onAction: () => {
        throw failure;
      },
      onError,
    });
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(onError).toHaveBeenCalledWith(failure);
    expect(thrown.open.value).toBe(true);
    thrown.wrapper.unmount();

    const rejected = harness({ onAction: () => Promise.reject(failure), onError });
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(onError).toHaveBeenCalledTimes(2);
    expect(rejected.open.value).toBe(true);
    expect(buttons()[1]!.disabled).toBe(false);
  });

  it('without @error, lets a thrown error propagate and logs a rejection', async () => {
    const failure = new Error('nope');
    const errorHandler = vi.fn();
    const wrapper = mount(PixelAlertDialog, {
      props: {
        open: true,
        title: 'Confirm',
        onAction: () => {
          throw failure;
        },
      },
      global: { config: { errorHandler } },
      attachTo: document.body,
    });
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(errorHandler).toHaveBeenCalledWith(failure, expect.anything(), expect.anything());
    expect(dialog()).not.toBeNull();
    wrapper.unmount();

    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    harness({ onAction: () => Promise.reject(failure) });
    await settle();
    buttons()[1]!.click();
    await settle();
    expect(log).toHaveBeenCalledWith('[PixelAlertDialog] onAction rejected:', failure);
    log.mockRestore();
  });

  it('names and describes the dialog', async () => {
    harness({ description: 'This cannot be undone.' });
    await settle();
    expect(document.getElementById(dialog()!.getAttribute('aria-labelledby')!)!.textContent).toBe('Delete file?');
    expect(document.getElementById(dialog()!.getAttribute('aria-describedby')!)!.textContent).toBe('This cannot be undone.');
  });

  it('sets the texts beside the accent and the buttons below on the linear surface', async () => {
    harness({ surface: 'linear', description: 'Details' });
    await settle();
    const [header, actions] = Array.from(dialog()!.children) as HTMLElement[];
    expect(header!.querySelector('h2')!.parentElement!.className).toBe('flex-1');
    expect(header!.querySelector('p')!.textContent).toBe('Details');
    expect(actions!.querySelectorAll('button')).toHaveLength(2);
    expect(dialog()!.children).toHaveLength(2);
  });

  it('exposes the dialog panel', async () => {
    const instance = ref<{ element: HTMLElement | null } | null>(null);
    mount(() => h(PixelAlertDialog, { ref: instance, open: true, title: 'Confirm', onAction: () => {} }), {
      attachTo: document.body,
    });
    await settle();
    expect(instance.value?.element).toBe(dialog());
  });
});
