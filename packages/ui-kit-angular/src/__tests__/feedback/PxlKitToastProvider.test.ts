/**
 * <pxl-toast-provider> and injectToast(): the API through injection and
 * through a template reference, the queue it holds, the error outside a
 * provider, the viewport (portalled once rendered in the browser) and its
 * stack. Rendering and the shared flows are covered against React by the
 * parity suite.
 */
import { Component, Injector, runInInjectionContext, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PXLKIT_TOAST,
  PxlKitSurfaceProvider,
  PxlKitToastProvider,
  injectToast,
  type ToastApi,
} from '../../public-api';

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));
const viewport = () => document.querySelector<HTMLElement>('[data-pxl-toast-viewport]')!;
const cards = () => Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast]'));
const titles = () => cards().map((card) => card.querySelector('p')!.textContent);

/** Captures `injectToast()` inside the provider, as an application component would. */
@Component({ selector: 'pxl-test-capture', template: '' })
class Capture {
  readonly api = injectToast();
}

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    await fixture.whenStable();
    await wait(0);
    await fixture.whenStable();
  };
  await settle();
  return { fixture, settle };
}

async function harness(template = '<pxl-toast-provider><pxl-test-capture /></pxl-toast-provider>') {
  @Component({ imports: [PxlKitToastProvider, PxlKitSurfaceProvider, Capture], template })
  class Host {}
  const { fixture, settle } = await render(Host);
  const api = (nth = 0): ToastApi => fixture.debugElement.queryAll((el) => el.componentInstance instanceof Capture)[nth]!.componentInstance.api;
  return { api, settle };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('injectToast', () => {
  it('throws outside a provider', () => {
    expect(() => runInInjectionContext(TestBed.inject(Injector), () => injectToast())).toThrow(
      'injectToast must be used inside <pxl-toast-provider>.',
    );
  });

  it('reaches the provider from projected content, as the provider itself does', async () => {
    @Component({
      imports: [PxlKitToastProvider, Capture],
      template: `<pxl-toast-provider #toaster><pxl-test-capture /></pxl-toast-provider>`,
    })
    class Host {}
    const { fixture } = await render(Host);
    const provider = fixture.debugElement.query((el) => el.componentInstance instanceof PxlKitToastProvider)!;
    const capture = fixture.debugElement.query((el) => el.componentInstance instanceof Capture)!;
    expect(capture.componentInstance.api).toBe(provider.componentInstance);
    expect(capture.injector.get(PXLKIT_TOAST)).toBe(provider.componentInstance);
  });

  it('pushes toasts with the tone shortcuts, returning ids that update and dismiss them', async () => {
    const { api, settle } = await harness();
    const { toast, dismiss, update, toasts } = api();
    const id = toast.success('ok', 'all good');
    toast.error('fail');
    toast.info('fyi');
    toast.warning({ title: 'careful', duration: 1000 });
    toast.loading('working');
    expect(toasts().map((t) => [t.title, t.tone])).toEqual([
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
    expect(toasts()).toHaveLength(4);
    expect(cards()).toHaveLength(4);
    expect(toast.update).toBe(update);
    expect(toast.dismiss).toBe(dismiss);
  });

  it('clears every toast and drops the oldest beyond max', async () => {
    const { api, settle } = await harness('<pxl-toast-provider [max]="2"><pxl-test-capture /></pxl-toast-provider>');
    for (const title of ['first', 'second', 'third']) api().toast({ title });
    await settle();
    expect(titles()).toEqual(['second', 'third']);
    api().clear();
    await settle();
    expect(cards()).toHaveLength(0);
    expect(api().toasts()).toEqual([]);
  });

  it('turns a promise toast into the success toast, or the error toast, passing the outcome on', async () => {
    const { api, settle } = await harness();
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
    expect(cards().map((card) => [card.getAttribute('role'), ...Array.from(card.querySelectorAll('p'), (p) => p.textContent)])).toEqual([
      ['status', 'Saved #42'],
      ['alert', 'Failed', 'boom'],
    ]);
  });
});

describe('PxlKitToastProvider', () => {
  it('portals the "Notifications" region into the body, keeping its host layout-neutral', async () => {
    await harness('<pxl-toast-provider position="bottom-left"><p id="app">app</p></pxl-toast-provider>');
    const host = document.querySelector<HTMLElement>('pxl-toast-provider')!;
    expect(host.style.display).toBe('contents');
    expect(host.hasAttribute('position')).toBe(true);
    expect(host.contains(viewport())).toBe(false);
    expect(viewport().parentElement).toBe(document.body);
    expect(viewport().getAttribute('role')).toBe('region');
    expect(viewport().getAttribute('aria-label')).toBe('Notifications');
    expect(viewport().classList).toContain('bottom-4');
    expect(viewport().classList).toContain('left-4');
    expect(document.getElementById('app')!.parentElement).toBe(host);
  });

  it('removes a toast from its dismiss button and once its duration has passed', async () => {
    const { api, settle } = await harness();
    api().toast({ title: 'manual', duration: 0 });
    api().toast({ title: 'timed', duration: 50 });
    await settle();
    cards()[0]!.querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]')!.click();
    await settle();
    expect(titles()).toEqual(['timed']);
    await vi.waitFor(async () => {
      await settle();
      expect(cards()).toHaveLength(0);
    });
  });

  it('expands the stack while hovered or focused, and never a flat list', async () => {
    const { api, settle } = await harness(`
      <pxl-toast-provider><pxl-test-capture /></pxl-toast-provider>
      <pxl-toast-provider [stacked]="false"><pxl-test-capture /></pxl-toast-provider>
    `);
    api(0).toast.loading('one');
    api(1).toast.loading('flat');
    await settle();
    const [stack, flat] = Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast-viewport]'));
    stack!.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(stack!.dataset.expanded).toBe('true');
    stack!.querySelector('button')!.focus();
    stack!.dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(stack!.dataset.expanded).toBe('true');
    stack!.querySelector('button')!.blur();
    await settle();
    expect(stack!.dataset.expanded).toBe('false');

    flat!.dispatchEvent(new MouseEvent('mouseenter'));
    flat!.querySelector('button')!.focus();
    await settle();
    expect(flat!.dataset.expanded).toBe('false');
    expect(flat!.dataset.stacked).toBe('false');
  });

  it('draws the toasts on the surface of the nearest provider unless given one', async () => {
    const { api, settle } = await harness(`
      <ng-container pxlKitSurface="linear">
        <pxl-toast-provider><pxl-test-capture /></pxl-toast-provider>
        <pxl-toast-provider surface="pixel"><pxl-test-capture /></pxl-toast-provider>
      </ng-container>
    `);
    api(0).toast({ title: 'linear' });
    await settle();
    api(1).toast({ title: 'pixel' });
    await settle();
    const [linear, pixel] = cards();
    expect(linear!.classList).toContain('rounded-xl');
    expect(pixel!.classList).toContain('pxl-corner-md');
  });

  it('can be reached from the template through a reference', async () => {
    @Component({
      imports: [PxlKitToastProvider],
      template: `
        <pxl-toast-provider #toaster>
          <button type="button" id="push" (click)="toaster.toast({ title: 'From the template' })">
            {{ toaster.toasts().length }} toasts
          </button>
        </pxl-toast-provider>
      `,
    })
    class Host {}
    const { settle } = await render(Host);
    document.getElementById('push')!.click();
    await settle();
    expect(titles()).toEqual(['From the template']);
    expect(document.getElementById('push')!.textContent!.trim()).toBe('1 toasts');
  });
});
