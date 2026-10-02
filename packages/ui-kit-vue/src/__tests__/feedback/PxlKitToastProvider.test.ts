/**
 * PxlKitToastProvider and useToast: the API through injection and through
 * the default slot, the queue it holds, the error outside a provider, the
 * viewport (portalled once mounted, never on the server) and its stack.
 * Rendering and the shared flows are covered against React by the parity
 * suite.
 */
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, defineComponent, h, nextTick, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { PxlKitSurfaceProvider, PxlKitToastProvider, useToast, type UseToastReturn } from '../../index';

enableAutoUnmount(afterEach);

const settle = async () => {
  await nextTick();
  await new Promise((done) => setTimeout(done, 0));
  await nextTick();
};

const viewport = () => document.querySelector<HTMLElement>('[data-pxl-toast-viewport]')!;
const cards = () => Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast]'));
const titles = () => cards().map((card) => card.querySelector('p')!.textContent);

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
    toast.warning({ title: 'careful', duration: 1000 });
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
      ['status', 'Saved #42'],
      ['alert', 'Failedboom'],
    ]);
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

  it('portals the "Notifications" region into the body once mounted', async () => {
    await harness();
    expect(viewport().parentElement).toBe(document.body);
    expect(document.getElementById('app')!.parentElement!.contains(viewport())).toBe(false);
    expect(viewport().getAttribute('role')).toBe('region');
    expect(viewport().getAttribute('aria-label')).toBe('Notifications');
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
    const { api } = await harness();
    api().toast({ title: 'manual', duration: 0 });
    api().toast({ title: 'timed', duration: 50 });
    await settle();
    cards()[0]!.querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]')!.click();
    await settle();
    expect(titles()).toEqual(['timed']);
    await vi.waitFor(() => expect(cards()).toHaveLength(0));
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
