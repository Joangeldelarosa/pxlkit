/**
 * <pxl-toast-card>: the (dismiss) output, the auto-dismiss countdown and what
 * holds it — the pointer, focus, a hidden page, a window in the background —
 * and the content its toast carries as text or templates. Rendering is
 * covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelToast, type ToastItem } from '../../public-api';

const card = () => document.querySelector<HTMLElement>('pxl-toast-card')!;
const bar = () => card().querySelector<HTMLElement>('[aria-hidden="true"] > div')!;

/**
 * Runs the countdown and Angular's scheduler on simulated time: the clock
 * moves only when a test moves it, however busy the machine is.
 */
const useSimulatedTime = () =>
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'Date'] });

// A task passes — on the fake clock when the test runs on one.
const tick = () => (vi.isFakeTimers() ? vi.advanceTimersByTimeAsync(0) : new Promise((done) => setTimeout(done, 0)));

@Component({
  imports: [PixelToast],
  template: `
    <pxl-toast-card [toast]="toast()" (dismiss)="dismissed = dismissed + 1" />
    <ng-template #undo><button type="button" id="undo">Undo</button></ng-template>
  `,
})
class Host {
  readonly toast = signal<ToastItem>({ id: 't', title: 'Saved', duration: 0 });
  dismissed = 0;
}

async function render<T>(Component: Type<T>) {
  const fixture = TestBed.createComponent(Component);
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
  return { fixture, host: fixture.componentInstance, settle };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('PixelToast', () => {
  it('emits (dismiss) from its button and leaves its removal to the owner', async () => {
    const { host, settle } = await render(Host);
    card().querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]')!.click();
    await settle();
    expect(host.dismissed).toBe(1);
    expect(card().isConnected).toBe(true);
  });

  it('is no live region of its own, whatever its tone: the provider announces it', async () => {
    const { host, settle } = await render(Host);
    const announcing = () => ['role', 'aria-live', 'aria-atomic'].map((name) => card().getAttribute(name));
    expect(announcing()).toEqual([null, null, null]);
    host.toast.set({ id: 't', title: 'Low disk', tone: 'gold', duration: 0 });
    await settle();
    expect(announcing()).toEqual([null, null, null]);
    host.toast.set({ id: 't', title: 'Heads up', assertive: true, duration: 0 });
    await settle();
    expect(announcing()).toEqual([null, null, null]);
  });

  it('renders text and templates, the animated icon winning over the icon, and a spinner while loading', async () => {
    @Component({
      imports: [PixelToast],
      template: `
        <pxl-toast-card id="templates" [toast]="{ id: 'a', title: 'A', duration: 0, icon: 'plain', animatedIcon: spin, action: undo }" />
        <pxl-toast-card id="text" [toast]="{ id: 'b', title: 'B', duration: 0, icon: 'plain', action: 'See details' }" />
        <pxl-toast-card id="loading" [toast]="{ id: 'c', title: 'C', loading: true, icon: 'plain', duration: 4500 }" />
        <ng-template #spin><i data-testid="animated"></i></ng-template>
        <ng-template #undo><button type="button">Undo</button></ng-template>
      `,
    })
    class Contents {}
    await render(Contents);
    const templates = document.getElementById('templates')!;
    expect(templates.querySelector('[data-pxl-toast-leading] [data-testid="animated"]')).not.toBeNull();
    expect(templates.textContent).not.toContain('plain');
    expect(templates.querySelector('.mt-2\\.5 button')!.textContent).toBe('Undo');
    const text = document.getElementById('text')!;
    expect(text.querySelector('[data-pxl-toast-leading]')!.textContent).toBe('plain');
    expect(text.querySelector('.mt-2\\.5')!.textContent).toBe('See details');
    const loading = document.getElementById('loading')!;
    expect(loading.querySelector('[data-pxl-toast-leading] [role="presentation"][class~="motion-safe:animate-spin"]')).not.toBeNull();
    expect(loading.getAttribute('data-loading')).toBe('true');
    expect(loading.querySelector('.h-0\\.5')).toBeNull();
  });

  it('dismisses once its duration has passed, shrinking its bar meanwhile', async () => {
    useSimulatedTime();
    const { host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saved', duration: 1000 });
    await settle();
    expect(bar().style.width).toBe('0%');
    expect(bar().style.transitionDuration).toBe('1000ms');
    await vi.advanceTimersByTimeAsync(999);
    expect(host.dismissed).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(host.dismissed).toBe(1);
  });

  it('holds still until both the pointer and focus have left, losing no time meanwhile', async () => {
    useSimulatedTime();
    @Component({
      imports: [PixelToast],
      template: `
        <pxl-toast-card [toast]="{ id: 't', title: 'Deleted', duration: 2000, action: undo }" (dismiss)="dismissed = dismissed + 1" />
        <ng-template #undo><button type="button" id="undo">Undo</button></ng-template>
      `,
    })
    class Held {
      dismissed = 0;
    }
    const { host, settle } = await render(Held);
    const undo = document.getElementById('undo')!;
    await vi.advanceTimersByTimeAsync(500);
    card().dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(1000);
    undo.focus();
    card().dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(bar().style.width).toBe('75%');
    await vi.advanceTimersByTimeAsync(10_000);
    expect(host.dismissed).toBe(0);

    undo.blur();
    await settle();
    expect(bar().style.transitionDuration).toBe('1500ms');
    await vi.advanceTimersByTimeAsync(1499);
    expect(host.dismissed).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(host.dismissed).toBe(1);
  });

  it('counts down the new duration once a loading toast settles, held if hovered meanwhile', async () => {
    useSimulatedTime();
    const { host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saving…', loading: true });
    await settle();
    card().dispatchEvent(new MouseEvent('mouseenter'));
    host.toast.set({ id: 't', title: 'Saved', tone: 'green', loading: false, duration: 1000 });
    await settle();
    expect(bar().style.width).toBe('100%');
    await vi.advanceTimersByTimeAsync(5000);
    expect(host.dismissed).toBe(0);
    card().dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(bar().style.transitionDuration).toBe('1000ms');
    await vi.advanceTimersByTimeAsync(1000);
    expect(host.dismissed).toBe(1);
  });

  it('holds still while the page is hidden or the window in the background, until both come back', async () => {
    useSimulatedTime();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    const { host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saved', duration: 4000 });
    await settle();
    await vi.advanceTimersByTimeAsync(1000);
    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new FocusEvent('blur'));
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    await settle();
    expect([bar().style.width, bar().style.transitionDuration]).toEqual(['75%', '0ms']);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(host.dismissed).toBe(0);

    window.dispatchEvent(new FocusEvent('focus'));
    await settle();
    expect(bar().style.transitionDuration).toBe('3000ms');
    await vi.advanceTimersByTimeAsync(3000);
    expect(host.dismissed).toBe(1);
  });

  it('waits for a hidden page to come back before counting down', async () => {
    useSimulatedTime();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const { host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saved', duration: 1000 });
    await settle();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(host.dismissed).toBe(0);
    expect([bar().style.width, bar().style.transitionDuration]).toEqual(['100%', '0ms']);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    await settle();
    expect(bar().style.transitionDuration).toBe('1000ms');
    await vi.advanceTimersByTimeAsync(1000);
    expect(host.dismissed).toBe(1);
  });

  it('stops its timer when destroyed', async () => {
    // Watched rather than waited for: the countdown is cleared on destroy.
    const started = vi.spyOn(globalThis, 'setTimeout');
    const cleared = vi.spyOn(globalThis, 'clearTimeout');
    const { fixture, host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saved', duration: 60_000 });
    await settle();
    const countdown = started.mock.calls.findIndex(([, delay]) => (delay ?? 0) > 59_000);
    expect(countdown).toBeGreaterThanOrEqual(0);
    fixture.destroy();
    expect(cleared).toHaveBeenCalledWith(started.mock.results[countdown]!.value);
    expect(host.dismissed).toBe(0);
  });
});

describe('PixelToast — loading spinner', () => {
  it('turns the spinner of a loading toast only for a reader who allows motion', async () => {
    const { host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saving', loading: true, duration: 0 });
    await settle();
    const classes = Array.from(card().querySelector('[role="presentation"]')!.classList);
    expect(classes).toContain('motion-safe:animate-spin');
    expect(classes).not.toContain('animate-spin');
  });
});
