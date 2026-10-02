/**
 * <pxl-toast-card>: the (dismiss) output, the auto-dismiss countdown and what
 * holds it, and the content its toast carries as text or templates.
 * Rendering is covered against React by the parity suite.
 */
import { Component, signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelToast, type ToastItem } from '../../public-api';

const card = () => document.querySelector<HTMLElement>('pxl-toast-card')!;
const bar = () => card().querySelector<HTMLElement>('[aria-hidden="true"] > div')!;
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

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
  const settle = async () => {
    await fixture.whenStable();
    await wait(0);
    await fixture.whenStable();
  };
  await settle();
  return { fixture, host: fixture.componentInstance, settle };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('PixelToast', () => {
  it('emits (dismiss) from its button and leaves its removal to the owner', async () => {
    const { host, settle } = await render(Host);
    card().querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]')!.click();
    await settle();
    expect(host.dismissed).toBe(1);
    expect(card().isConnected).toBe(true);
  });

  it('announces politely, or assertively for critical tones and assertive toasts', async () => {
    const { host, settle } = await render(Host);
    expect([card().getAttribute('role'), card().getAttribute('aria-live'), card().getAttribute('aria-atomic')]).toEqual([
      'status',
      'polite',
      'true',
    ]);
    host.toast.set({ id: 't', title: 'Low disk', tone: 'gold', duration: 0 });
    await settle();
    expect([card().getAttribute('role'), card().getAttribute('aria-live')]).toEqual(['alert', 'assertive']);
    host.toast.set({ id: 't', title: 'Heads up', assertive: true, duration: 0 });
    await settle();
    expect(card().getAttribute('role')).toBe('alert');
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
    expect(loading.querySelector('[data-pxl-toast-leading] [role="presentation"].animate-spin')).not.toBeNull();
    expect(loading.getAttribute('data-loading')).toBe('true');
    expect(loading.querySelector('.h-0\\.5')).toBeNull();
  });

  it('dismisses once its duration has passed, shrinking its bar meanwhile', async () => {
    const { host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saved', duration: 60 });
    await settle();
    expect(bar().style.width).toBe('0%');
    expect(bar().style.transitionDuration).toBe('60ms');
    expect(host.dismissed).toBe(0);
    await vi.waitFor(() => expect(host.dismissed).toBe(1));
  });

  it('holds still until both the pointer and focus have left, losing no time meanwhile', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    @Component({
      imports: [PixelToast],
      template: `
        <pxl-toast-card [toast]="{ id: 't', title: 'Deleted', duration: 400, action: undo }" (dismiss)="dismissed = dismissed + 1" />
        <ng-template #undo><button type="button" id="undo">Undo</button></ng-template>
      `,
    })
    class Held {
      dismissed = 0;
    }
    const { host, settle } = await render(Held);
    const undo = document.getElementById('undo')!;
    vi.advanceTimersByTime(100);
    card().dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(200);
    undo.focus();
    card().dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(bar().style.width).toBe('75%');
    await wait(500);
    expect(host.dismissed).toBe(0);

    undo.blur();
    await settle();
    expect(bar().style.transitionDuration).toBe('300ms');
    await vi.waitFor(() => expect(host.dismissed).toBe(1));
  });

  it('counts down the new duration once a loading toast settles, held if hovered meanwhile', async () => {
    const { host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saving…', loading: true });
    await settle();
    card().dispatchEvent(new MouseEvent('mouseenter'));
    host.toast.set({ id: 't', title: 'Saved', tone: 'green', loading: false, duration: 60 });
    await settle();
    expect(bar().style.width).toBe('100%');
    await wait(150);
    expect(host.dismissed).toBe(0);
    card().dispatchEvent(new MouseEvent('mouseleave'));
    await settle();
    expect(bar().style.transitionDuration).toBe('60ms');
    await vi.waitFor(() => expect(host.dismissed).toBe(1));
  });

  it('stops its timer when destroyed', async () => {
    const { fixture, host, settle } = await render(Host);
    host.toast.set({ id: 't', title: 'Saved', duration: 40 });
    await settle();
    fixture.destroy();
    await wait(100);
    expect(host.dismissed).toBe(0);
  });
});
