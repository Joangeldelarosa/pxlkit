/**
 * PxlKitToastProvider and useToast: the API through injection and through
 * the default slot, the queue it holds, the error outside a provider, the
 * viewport (portalled once mounted, never on the server), its stack, its
 * hotkey, its live regions, focus when a focused toast leaves, and the
 * `duration` and `hotkey` props. Rendering and the shared flows are covered
 * against React by the parity suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, defineComponent, h, nextTick, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { PxlKitSurfaceProvider, PxlKitToastProvider, useToast, type UseToastReturn } from '../../index';

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.useRealTimers();
});

// A task passes — on the fake clock when the test runs on one.
const settle = async () => {
  await nextTick();
  await (vi.isFakeTimers() ? vi.advanceTimersByTimeAsync(0) : new Promise((done) => setTimeout(done, 0)));
  await nextTick();
};

const viewport = () => document.querySelector<HTMLElement>('[data-pxl-toast-viewport]')!;
const cards = () => Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast]'));
const titles = () => cards().map((card) => card.querySelector('p')!.textContent);
const region = (role: 'status' | 'alert') => viewport().querySelector<HTMLElement>(`[role="${role}"]`)!;
const dismissButtons = () => Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast] button[aria-label="Dismiss notification"]'));
const press = (key: string, init: KeyboardEventInit = {}) =>
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

/** Mounts a provider around a child that captures `useToast()`. */
async function harness(props: Record<string, unknown> = {}, wrap: (inner: () => VNode) => VNode = (inner) => inner()) {
  let api!: UseToastReturn;
  const Child = defineComponent({
    setup() {
      api = useToast();
      return () => h('p', { id: 'app' }, 'app');
    },
  });
  const wrapper = mount(
    defineComponent({ render: () => wrap(() => h(PxlKitToastProvider, props, { default: () => h(Child) })) }),
    { attachTo: document.body },
  );
  await settle();
  return { api: () => api, wrapper };
}

describe('useToast', () => {
  it('throws outside a provider', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const Bare = defineComponent({
      setup() {
        useToast();
        return () => null;
      },
    });
    expect(() => mount(Bare)).toThrow('useToast must be used inside <PxlKitToastProvider>.');
  });

  it('pushes toasts with the tone shortcuts, returning ids that update and dismiss them', async () => {
    const { api } = await harness();
    const { toast, dismiss, update, toasts } = api();
    const id = toast.success('ok', 'all good');
    toast.error('fail');
    toast.info('fyi');
    toast.warning({ title: 'careful', duration: 60_000 });
    toast.loading('working');
    expect(toasts.value.map((t) => [t.title, t.tone])).toEqual([
      ['ok', 'green'],
      ['fail', 'red'],
      ['fyi', 'cyan'],
      ['careful', 'gold'],
      ['working', 'cyan'],
    ]);
    update(id, { title: 'done' });
    await settle();
    expect(titles()).toContain('done');
    dismiss(id);
    await settle();
    expect(toasts.value).toHaveLength(4);
    expect(cards()).toHaveLength(4);
    expect(toast.update).toBe(update);
    expect(toast.dismiss).toBe(dismiss);
  });

  it('clears every toast and drops the oldest beyond max', async () => {
    const { api } = await harness({ max: 2 });
    for (const title of ['first', 'second', 'third']) api().toast({ title });
    await settle();
    expect(titles()).toEqual(['second', 'third']);
    api().clear();
    await settle();
    expect(cards()).toHaveLength(0);
    expect(api().toasts.value).toEqual([]);
  });

  it('turns a promise toast into the success toast, or the error toast, passing the outcome on', async () => {
    const { api } = await harness();
    await expect(
      api().toast.promise(Promise.resolve(42), {
        loading: { title: 'Saving…' },
        success: (value) => ({ title: `Saved #${value}` }),
        error: { title: 'Failed' },
      }),
    ).resolves.toBe(42);
    const error = new Error('boom');
    await expect(
      api().toast.promise(() => Promise.reject(error), {
        loading: { title: 'Saving…' },
        success: { title: 'Saved' },
        error: (err) => ({ title: 'Failed', message: (err as Error).message }),
      }),
    ).rejects.toBe(error);
    await settle();
    expect(cards().map((card) => [card.getAttribute('role'), card.textContent])).toEqual([
      [null, 'Saved #42'],
      [null, 'Failedboom'],
    ]);
    // The error is announced assertively, replacing what was said before.
    expect([region('status').textContent, region('alert').textContent]).toEqual(['', 'Failed boom']);
  });

  it("gives toasts without their own duration the provider's, a promise error at least 6 s, and 0 keeps them", async () => {
    const { api } = await harness({ duration: 8000 });
    api().toast({ title: 'slow' });
    api().toast({ title: 'own', duration: 60_000 });
    await api()
      .toast.promise(Promise.reject(new Error('no')), { loading: { title: 'Saving…' }, success: { title: 'Saved' }, error: { title: 'Failed' } })
      .catch(() => {});
    expect(api().toasts.value.map((t) => t.duration)).toEqual([8000, 60_000, 8000]);

    const kept = await harness({ duration: 0 });
    kept.api().toast({ title: 'kept' });
    await kept
      .api()
      .toast.promise(Promise.reject(new Error('no')), { loading: { title: 'Saving…' }, success: { title: 'Saved' }, error: { title: 'Failed' } })
      .catch(() => {});
    expect(kept.api().toasts.value.map((t) => t.duration)).toEqual([0, 0]);
  });
});

describe('PxlKitToastProvider', () => {
  it('renders its content alone on the server', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(PxlKitToastProvider, null, { default: () => h('p', 'app') }) }),
    );
    expect(html).toContain('<p>app</p>');
    expect(html).not.toContain('data-pxl-toast-viewport');
  });

  it('portals the "Notifications (F8)" region into the body once mounted', async () => {
    await harness();
    expect(viewport().parentElement).toBe(document.body);
    expect(document.getElementById('app')!.parentElement!.contains(viewport())).toBe(false);
    expect(viewport().getAttribute('role')).toBe('region');
    expect(viewport().getAttribute('aria-label')).toBe('Notifications (F8)');
    expect(viewport().classList).toContain('top-4');
    expect(viewport().classList).toContain('right-4');
  });

  it('places the viewport at the position given', async () => {
    await harness({ position: 'bottom-left' });
    expect(viewport().classList).toContain('bottom-4');
    expect(viewport().classList).toContain('left-4');
  });

  it('passes the toast API to its default slot', async () => {
    mount(PxlKitToastProvider, {
      slots: {
        default: ({ toast, toasts }: { toast: UseToastReturn['toast']; toasts: readonly unknown[] }) =>
          h('button', { id: 'push', onClick: () => toast({ title: 'From the slot' }) }, `${toasts.length} toasts`),
      },
      attachTo: document.body,
    });
    await settle();
    document.getElementById('push')!.click();
    await settle();
    expect(titles()).toEqual(['From the slot']);
    expect(document.getElementById('push')!.textContent).toBe('1 toasts');
  });

  it('removes a toast from its dismiss button and once its duration has passed', async () => {
    // On simulated time: the countdown runs out when the clock says so, however busy the machine.
    vi.useFakeTimers();
    const { api } = await harness();
    api().toast({ title: 'manual', duration: 0 });
    const timed = api().toast({ title: 'timed', duration: 0 });
    await settle();
    cards()
      .find((card) => card.querySelector('p')!.textContent === 'manual')!
      .querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]')!
      .click();
    await settle();
    expect(titles()).toEqual(['timed']);
    api().update(timed, { duration: 1000 });
    await settle();
    await vi.advanceTimersByTimeAsync(999);
    await settle();
    expect(titles()).toEqual(['timed']);
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(cards()).toHaveLength(0);
  });

  it('expands the stack while hovered or focused, and never a flat list', async () => {
    const { api } = await harness();
    api().toast.loading('one');
    await settle();
    viewport().dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(viewport().dataset.expanded).toBe('true');
    cards()[0]!.querySelector('button')!.focus();
    viewport().dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(viewport().dataset.expanded).toBe('true');
    cards()[0]!.querySelector('button')!.blur();
    await settle();
    expect(viewport().dataset.expanded).toBe('false');

    const flat = await harness({ stacked: false });
    flat.api().toast.loading('one');
    await settle();
    const flatViewport = document.querySelectorAll<HTMLElement>('[data-pxl-toast-viewport]')[1]!;
    flatViewport.dispatchEvent(new MouseEvent('mouseenter'));
    flatViewport.querySelector('button')!.focus();
    await settle();
    expect(flatViewport.dataset.expanded).toBe('false');
    expect(flatViewport.dataset.stacked).toBe('false');
  });

  it('moves focus to the viewport with F8 while toasts are on screen, naming the hotkey', async () => {
    const { api } = await harness();
    expect(viewport().getAttribute('aria-label')).toBe('Notifications (F8)');
    expect(viewport().getAttribute('tabindex')).toBe('-1');
    press('F8');
    expect(document.activeElement).toBe(document.body);
    api().toast.loading('one');
    await settle();
    expect(press('F8', { shiftKey: true })).toBe(true);
    expect(document.activeElement).toBe(document.body);
    expect(press('F8')).toBe(false);
    expect(document.activeElement).toBe(viewport());
    await settle();
    expect(viewport().dataset.expanded).toBe('true');
  });

  it('takes another hotkey, or none', async () => {
    const { api, wrapper } = await harness({ hotkey: 'alt+t' });
    api().toast.loading('one');
    await settle();
    expect(viewport().getAttribute('aria-label')).toBe('Notifications (alt+t)');
    press('F8');
    expect(document.activeElement).toBe(document.body);
    press('t', { altKey: true });
    expect(document.activeElement).toBe(viewport());
    wrapper.unmount();

    const none = await harness({ hotkey: false });
    none.api().toast.loading('one');
    await settle();
    expect(viewport().getAttribute('aria-label')).toBe('Notifications');
    expect(press('F8')).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  it('hands focus from a leaving toast to the next one, the previous one, then back where it came from', async () => {
    const trigger = document.body.appendChild(document.createElement('button'));
    const { api } = await harness();
    for (const title of ['one', 'two', 'three']) api().toast.loading(title);
    await settle();
    const focusedTitle = () => document.activeElement!.closest('[data-pxl-toast]')!.querySelector('p')!.textContent;
    trigger.focus();
    dismissButtons()[0]!.focus();
    dismissButtons()[0]!.click();
    await settle();
    expect(focusedTitle()).toBe('two');
    dismissButtons()[1]!.focus();
    dismissButtons()[1]!.click();
    await settle();
    expect(focusedTitle()).toBe('two');
    // However it leaves: here by the API.
    api().dismiss(api().toasts.value[0]!.id);
    await settle();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('announces pushed toasts and changed ones in two live regions, there and empty before any toast', async () => {
    const { api } = await harness();
    expect([region('status').textContent, region('alert').textContent]).toEqual(['', '']);
    const id = api().toast.loading('Saving…');
    await settle();
    expect(region('status').textContent).toBe('Saving…');
    api().update(id, { loading: false });
    await settle();
    expect(region('status').textContent).toBe('Saving…');
    api().update(id, { title: 'Failed', message: 'Try again.', tone: 'red', loading: false });
    await settle();
    expect([region('status').textContent, region('alert').textContent]).toEqual(['', 'Failed Try again.']);

    // The same message again is new content, which the region reads again.
    const first = region('alert').firstElementChild;
    api().update(id, { tone: 'cyan' });
    await settle();
    api().update(id, { tone: 'red' });
    await settle();
    expect(region('alert').textContent).toBe('Failed Try again.');
    expect(region('alert').firstElementChild).not.toBe(first);

    // A message leaves the region with its toast.
    api().dismiss(id);
    await settle();
    expect(region('alert').textContent).toBe('');
  });

  it('draws the toasts on the surface of the nearest provider unless given one', async () => {
    const { api } = await harness({}, (inner) => h(PxlKitSurfaceProvider, { surface: 'linear' }, { default: inner }));
    api().toast({ title: 'linear' });
    await settle();
    expect(cards()[0]!.classList).toContain('rounded-xl');
    const pixel = await harness({ surface: 'pixel' }, (inner) =>
      h(PxlKitSurfaceProvider, { surface: 'linear' }, { default: inner }),
    );
    pixel.api().toast({ title: 'pixel' });
    await settle();
    expect(cards()[1]!.classList).toContain('pxl-corner-md');
  });
});
