/**
 * <pxl-toast-provider> and injectToast(): the API through injection and
 * through a template reference, the queue it holds, the error outside a
 * provider, the viewport (portalled once rendered in the browser), its stack,
 * its hotkey, its live regions, focus when a focused toast leaves, and the
 * `duration` and `hotkey` inputs. Rendering and the shared flows are covered
 * against React by the parity suite.
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

// A task passes — on the fake clock when the test runs on one.
const tick = () => (vi.isFakeTimers() ? vi.advanceTimersByTimeAsync(0) : new Promise((done) => setTimeout(done, 0)));
const viewport = () => document.querySelector<HTMLElement>('[data-pxl-toast-viewport]')!;
const cards = () => Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast]'));
const titles = () => cards().map((card) => card.querySelector('p')!.textContent);
const region = (role: 'status' | 'alert') => viewport().querySelector<HTMLElement>(`[role="${role}"]`)!;
const dismissButtons = () => Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast] button[aria-label="Dismiss notification"]'));
const press = (key: string, init: KeyboardEventInit = {}) =>
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

/** Captures `injectToast()` inside the provider, as an application component would. */
@Component({ selector: 'pxl-test-capture', template: '' })
class Capture {
  readonly api = injectToast();
}

async function render<T>(Host: Type<T>) {
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  // On simulated time, change detection scheduled on a timer runs only as
  // the clock moves: run what is due until nothing is pending.
  const stable = async () => {
    for (let round = 0; round < 100 && !fixture.isStable(); round++) await tick();
    await fixture.whenStable();
  };
  const settle = async () => {
    await stable();
    await tick();
    await stable();
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
  vi.useRealTimers();
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
    toast.warning({ title: 'careful', duration: 60_000 });
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
      [null, 'Saved #42'],
      [null, 'Failed', 'boom'],
    ]);
    // The error is announced assertively, replacing what was said before.
    expect([region('status').textContent!.trim(), region('alert').textContent!.trim()]).toEqual(['', 'Failed boom']);
  });

  it("gives toasts without their own duration the provider's, a promise error at least 6 s, and 0 keeps them", async () => {
    const { api } = await harness(`
      <pxl-toast-provider [duration]="8000"><pxl-test-capture /></pxl-toast-provider>
      <pxl-toast-provider [duration]="0"><pxl-test-capture /></pxl-toast-provider>
    `);
    const options = { loading: { title: 'Saving…' }, success: { title: 'Saved' }, error: { title: 'Failed' } };
    api(0).toast({ title: 'slow' });
    api(0).toast({ title: 'own', duration: 60_000 });
    await api(0).toast.promise(Promise.reject(new Error('no')), options).catch(() => {});
    expect(api(0).toasts().map((t) => t.duration)).toEqual([8000, 60_000, 8000]);
    api(1).toast({ title: 'kept' });
    await api(1).toast.promise(Promise.reject(new Error('no')), options).catch(() => {});
    expect(api(1).toasts().map((t) => t.duration)).toEqual([0, 0]);
  });
});

describe('PxlKitToastProvider', () => {
  it('portals the "Notifications (F8)" region into the body, keeping its host layout-neutral', async () => {
    await harness('<pxl-toast-provider position="bottom-left"><p id="app">app</p></pxl-toast-provider>');
    const host = document.querySelector<HTMLElement>('pxl-toast-provider')!;
    expect(host.style.display).toBe('contents');
    expect(host.hasAttribute('position')).toBe(true);
    expect(host.contains(viewport())).toBe(false);
    expect(viewport().parentElement).toBe(document.body);
    expect(viewport().getAttribute('role')).toBe('region');
    expect(viewport().getAttribute('aria-label')).toBe('Notifications (F8)');
    expect(viewport().classList).toContain('bottom-4');
    expect(viewport().classList).toContain('left-4');
    expect(document.getElementById('app')!.parentElement).toBe(host);
  });

  it('removes a toast from its dismiss button and once its duration has passed', async () => {
    // On simulated time: the countdown runs out when the clock says so, however busy the machine.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'Date'] });
    const { api, settle } = await harness();
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
    // The countdown runs out at 1000 ms; the change detection its callback
    // schedules runs a millisecond later on the fake clock.
    await vi.advanceTimersByTimeAsync(2);
    await settle();
    expect(cards()).toHaveLength(0);
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

  it('moves focus to the viewport with F8 while toasts are on screen, naming the hotkey', async () => {
    const { api, settle } = await harness();
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
    const { api, settle } = await harness(`
      <pxl-toast-provider hotkey="alt+t"><pxl-test-capture /></pxl-toast-provider>
      <pxl-toast-provider [hotkey]="false"><pxl-test-capture /></pxl-toast-provider>
    `);
    api(0).toast.loading('one');
    api(1).toast.loading('one');
    await settle();
    const [custom, none] = Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast-viewport]'));
    expect([custom!.getAttribute('aria-label'), none!.getAttribute('aria-label')]).toEqual(['Notifications (alt+t)', 'Notifications']);
    expect(press('F8')).toBe(true);
    expect(document.activeElement).toBe(document.body);
    press('t', { altKey: true });
    expect(document.activeElement).toBe(custom);
  });

  it('hands focus from a leaving toast to the next one, the previous one, then back where it came from', async () => {
    const trigger = document.body.appendChild(document.createElement('button'));
    const { api, settle } = await harness();
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
    api().dismiss(api().toasts()[0]!.id);
    await settle();
    expect(document.activeElement).toBe(trigger);
  });

  it('announces pushed toasts and changed ones in two live regions, there and empty before any toast', async () => {
    const { api, settle } = await harness();
    const said = (role: 'status' | 'alert') => region(role).textContent!.trim();
    expect([said('status'), said('alert')]).toEqual(['', '']);
    const id = api().toast.loading('Saving…');
    await settle();
    expect(said('status')).toBe('Saving…');
    api().update(id, { loading: false });
    await settle();
    expect(said('status')).toBe('Saving…');
    api().update(id, { title: 'Failed', message: 'Try again.', tone: 'red', loading: false });
    await settle();
    expect([said('status'), said('alert')]).toEqual(['', 'Failed Try again.']);

    // The same message again is new content, which the region reads again.
    const first = region('alert').querySelector('p');
    api().update(id, { tone: 'cyan' });
    await settle();
    api().update(id, { tone: 'red' });
    await settle();
    expect(said('alert')).toBe('Failed Try again.');
    expect(region('alert').querySelector('p')).not.toBe(first);

    // A message leaves the region with its toast.
    api().dismiss(id);
    await settle();
    expect(said('alert')).toBe('');
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
