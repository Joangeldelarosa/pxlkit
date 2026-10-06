import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PxlKitToastProvider, useToast } from '../../feedback/PxlKitToastProvider';

type Listener = (e: { matches: boolean }) => void;

function createMatchMediaMock(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: vi.fn((_evt: string, cb: Listener) => { listeners.add(cb); }),
    removeEventListener: vi.fn((_evt: string, cb: Listener) => { listeners.delete(cb); }),
    addListener: vi.fn((cb: Listener) => listeners.add(cb)),
    removeListener: vi.fn((cb: Listener) => listeners.delete(cb)),
    dispatchEvent: vi.fn(),
    onchange: null,
  };
  return { mql };
}

/**
 * Test harness: exposes the `useToast()` return through a ref so each test
 * can call helpers without rebuilding a wrapper UI.
 */
type ToastApi = ReturnType<typeof useToast>;
function makeHarness() {
  const apiRef: { current: ToastApi | null } = { current: null };
  const Capture: React.FC = () => {
    apiRef.current = useToast();
    return null;
  };
  return { apiRef, Capture };
}

describe('PxlKitToastProvider', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    const { mql } = createMatchMediaMock(false);
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      // @ts-expect-error cleanup
      delete window.matchMedia;
    }
    vi.restoreAllMocks();
  });

  it('renders its children', () => {
    render(
      <PxlKitToastProvider>
        <span data-testid="app">app content</span>
      </PxlKitToastProvider>,
    );
    expect(screen.getByTestId('app').textContent).toBe('app content');
  });

  it('useToast throws when used outside the provider', () => {
    const Bare: React.FC = () => {
      useToast();
      return null;
    };
    // Silence React's error boundary noise for the expected throw.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bare />)).toThrow(/inside <PxlKitToastProvider>/);
    spy.mockRestore();
  });

  it('renders a pushed toast in the portal viewport', () => {
    const { apiRef, Capture } = makeHarness();
    render(
      <PxlKitToastProvider>
        <Capture />
      </PxlKitToastProvider>,
    );
    act(() => {
      apiRef.current!.toast({ title: 'Saved!', message: 'Row 42 stored' });
    });
    const viewport = document.querySelector('[data-pxl-toast-viewport]') as HTMLElement;
    expect(viewport).toBeTruthy();
    expect(viewport.textContent).toContain('Saved!');
    expect(viewport.textContent).toContain('Row 42 stored');
  });

  it('dismiss(id) removes the toast from the viewport', () => {
    const { apiRef, Capture } = makeHarness();
    render(
      <PxlKitToastProvider>
        <Capture />
      </PxlKitToastProvider>,
    );
    let id = '';
    act(() => { id = apiRef.current!.toast({ title: 'temp' }); });
    expect(document.querySelector('[data-pxl-toast-viewport]')!.textContent).toContain('temp');
    act(() => { apiRef.current!.dismiss(id); });
    expect(document.querySelector('[data-pxl-toast-viewport]')!.textContent).not.toContain('temp');
  });

  it('clear() empties every active toast', () => {
    const { apiRef, Capture } = makeHarness();
    render(
      <PxlKitToastProvider>
        <Capture />
      </PxlKitToastProvider>,
    );
    act(() => {
      apiRef.current!.toast({ title: 'one' });
      apiRef.current!.toast({ title: 'two' });
    });
    expect(apiRef.current!.toasts).toHaveLength(2);
    act(() => { apiRef.current!.clear(); });
    expect(apiRef.current!.toasts).toHaveLength(0);
    expect(document.querySelectorAll('[data-pxl-toast-slot]')).toHaveLength(0);
  });

  it('max caps simultaneous toasts, dropping the oldest', () => {
    const { apiRef, Capture } = makeHarness();
    render(
      <PxlKitToastProvider max={2}>
        <Capture />
      </PxlKitToastProvider>,
    );
    act(() => {
      apiRef.current!.toast({ title: 'first' });
      apiRef.current!.toast({ title: 'second' });
      apiRef.current!.toast({ title: 'third' });
    });
    const titles = apiRef.current!.toasts.map((t) => t.title);
    expect(titles).toEqual(['second', 'third']);
    const viewport = document.querySelector('[data-pxl-toast-viewport]') as HTMLElement;
    expect(viewport.textContent).not.toContain('first');
  });

  it('position prop drives the viewport placement classes', () => {
    render(
      <PxlKitToastProvider position="bottom-left">
        <div />
      </PxlKitToastProvider>,
    );
    const viewport = document.querySelector('[data-pxl-toast-viewport]') as HTMLElement;
    expect(viewport.className).toContain('bottom-4');
    expect(viewport.className).toContain('left-4');
  });

  it('defaults to top-right placement', () => {
    render(
      <PxlKitToastProvider>
        <div />
      </PxlKitToastProvider>,
    );
    const viewport = document.querySelector('[data-pxl-toast-viewport]') as HTMLElement;
    expect(viewport.className).toContain('top-4');
    expect(viewport.className).toContain('right-4');
  });

  it('stacked={false} renders a flat (non-stacked) viewport', () => {
    render(
      <PxlKitToastProvider stacked={false}>
        <div />
      </PxlKitToastProvider>,
    );
    const viewport = document.querySelector('[data-pxl-toast-viewport]') as HTMLElement;
    expect(viewport.getAttribute('data-stacked')).toBe('false');
  });
});

describe('PxlKitToastProvider — viewport and stack', () => {
  const viewport = () => document.querySelector('[data-pxl-toast-viewport]') as HTMLElement;
  const dismissButtons = () => screen.getAllByRole('button', { name: 'Dismiss notification' });

  function renderWith(props: Partial<React.ComponentProps<typeof PxlKitToastProvider>> = {}) {
    const { apiRef, Capture } = makeHarness();
    render(
      <PxlKitToastProvider {...props}>
        <Capture />
      </PxlKitToastProvider>,
    );
    return apiRef;
  }

  // Regression: the pointer leaving collapsed the stack while focus was still
  // inside it, hiding the focused toast when it was deep in the stack.
  it('stays expanded while focus is inside, after the pointer has left', () => {
    const api = renderWith();
    act(() => {
      api.current!.toast.loading('one');
      api.current!.toast.loading('two');
    });
    fireEvent.mouseEnter(viewport());
    expect(viewport().getAttribute('data-expanded')).toBe('true');
    act(() => dismissButtons()[0]!.focus());
    fireEvent.mouseLeave(viewport());
    expect(viewport().getAttribute('data-expanded')).toBe('true');
    act(() => dismissButtons()[0]!.blur());
    expect(viewport().getAttribute('data-expanded')).toBe('false');
  });

  it('stays expanded while hovered, after focus has left', () => {
    const api = renderWith();
    act(() => { api.current!.toast.loading('one'); });
    act(() => dismissButtons()[0]!.focus());
    fireEvent.mouseEnter(viewport());
    act(() => dismissButtons()[0]!.blur());
    expect(viewport().getAttribute('data-expanded')).toBe('true');
    fireEvent.mouseLeave(viewport());
    expect(viewport().getAttribute('data-expanded')).toBe('false');
  });

  it('collapses when the pointer leaves after the focused toast was dismissed', () => {
    const api = renderWith();
    act(() => {
      api.current!.toast.loading('one');
      api.current!.toast.loading('two');
    });
    fireEvent.mouseEnter(viewport());
    act(() => dismissButtons()[1]!.focus());
    act(() => dismissButtons()[1]!.click());
    expect(api.current!.toasts.map((t) => t.title)).toEqual(['one']);
    // Focus moved on to the toast left, which keeps the stack open.
    fireEvent.mouseLeave(viewport());
    expect(viewport().getAttribute('data-expanded')).toBe('true');
    // Focus came from nowhere: with the last toast gone it stays on the body.
    fireEvent.mouseEnter(viewport());
    act(() => dismissButtons()[0]!.click());
    expect(document.activeElement).toBe(document.body);
    fireEvent.mouseLeave(viewport());
    expect(viewport().getAttribute('data-expanded')).toBe('false');
  });

  it('never expands a flat list', () => {
    const api = renderWith({ stacked: false });
    act(() => { api.current!.toast.loading('one'); });
    fireEvent.mouseEnter(viewport());
    act(() => dismissButtons()[0]!.focus());
    expect(viewport().getAttribute('data-expanded')).toBe('false');
  });

  // Regression: at the bottom of the screen the oldest toast was put in front
  // and the newest at the back of the stack, faded out beyond stackVisible.
  it('keeps the newest toast in front at the bottom of the screen', () => {
    const api = renderWith({ position: 'bottom-right' });
    act(() => {
      for (const title of ['1', '2', '3', '4']) api.current!.toast.loading(title);
    });
    const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-pxl-toast-slot]'));
    expect(slots.map((slot) => [slot.textContent, slot.getAttribute('data-depth'), slot.style.opacity])).toEqual([
      ['4', '0', '1'],
      ['3', '1', '1'],
      ['2', '2', '1'],
      ['1', '3', '0'],
    ]);
    expect(slots[0]!.style.zIndex).toBe('103');
  });

  // Regression: the viewport, at the end of the page, could only be reached by
  // tabbing through the whole page.
  it('moves focus to the viewport with F8 while toasts are on screen, naming the hotkey', () => {
    const api = renderWith();
    expect(viewport().getAttribute('aria-label')).toBe('Notifications (F8)');
    expect(viewport().getAttribute('tabindex')).toBe('-1');
    fireEvent.keyDown(document.body, { key: 'F8' });
    expect(document.activeElement).toBe(document.body);
    act(() => { api.current!.toast.loading('one'); });
    expect(fireEvent.keyDown(document.body, { key: 'F8', shiftKey: true })).toBe(true);
    expect(document.activeElement).toBe(document.body);
    expect(fireEvent.keyDown(document.body, { key: 'F8' })).toBe(false);
    expect(document.activeElement).toBe(viewport());
    expect(viewport().getAttribute('data-expanded')).toBe('true');
  });

  it('takes another hotkey, or none', () => {
    const custom = renderWith({ hotkey: 'alt+t' });
    act(() => { custom.current!.toast.loading('one'); });
    expect(viewport().getAttribute('aria-label')).toBe('Notifications (alt+t)');
    fireEvent.keyDown(document.body, { key: 'F8' });
    expect(document.activeElement).toBe(document.body);
    fireEvent.keyDown(document.body, { key: 't', altKey: true });
    expect(document.activeElement).toBe(viewport());
    cleanup();

    const none = renderWith({ hotkey: false });
    act(() => { none.current!.toast.loading('one'); });
    expect(viewport().getAttribute('aria-label')).toBe('Notifications');
    expect(fireEvent.keyDown(document.body, { key: 'F8' })).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  // Regression: dismissing the focused toast dropped focus to the body.
  it('hands focus from a leaving toast to the next one, the previous one, then back where it came from', () => {
    const trigger = document.body.appendChild(document.createElement('button'));
    const api = renderWith();
    act(() => {
      for (const title of ['one', 'two', 'three']) api.current!.toast.loading(title);
    });
    const focusedTitle = () => document.activeElement!.closest('[data-pxl-toast]')!.querySelector('p')!.textContent;
    act(() => trigger.focus());
    act(() => dismissButtons()[0]!.focus());
    act(() => dismissButtons()[0]!.click());
    expect(focusedTitle()).toBe('two');
    act(() => dismissButtons()[1]!.focus());
    act(() => dismissButtons()[1]!.click());
    expect(focusedTitle()).toBe('two');
    // However it leaves: here by the API.
    act(() => { api.current!.dismiss(api.current!.toasts[0]!.id); });
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  // Regression: each card was a live region inserted already filled, which
  // screen readers announce unreliably, and a promise that settled flipped it
  // from status to alert, which is not announced either.
  it('announces pushed toasts and changed ones in two live regions, there and empty before any toast', async () => {
    const api = renderWith();
    const status = screen.getByRole('status');
    const alert = screen.getByRole('alert');
    expect([status.textContent, alert.textContent]).toEqual(['', '']);
    expect(viewport().contains(status) && viewport().contains(alert)).toBe(true);
    // Toasts announced in one task are read together; each step here is a task of its own.
    const step = (change: () => void) => act(async () => change());

    let id = '';
    await step(() => { id = api.current!.toast.loading('Saving…'); });
    expect(status.textContent).toBe('Saving…');
    await step(() => api.current!.update(id, { loading: false }));
    expect(status.textContent).toBe('Saving…');
    await step(() => api.current!.update(id, { title: 'Failed', message: 'Try again.', tone: 'red', loading: false }));
    expect([status.textContent, alert.textContent]).toEqual(['', 'Failed Try again.']);

    // The same message again is new content, which the region reads again.
    const first = alert.firstElementChild;
    await step(() => api.current!.update(id, { tone: 'cyan' }));
    await step(() => api.current!.update(id, { tone: 'red' }));
    expect(alert.textContent).toBe('Failed Try again.');
    expect(alert.firstElementChild).not.toBe(first);

    // Toasts pushed together are read together; a message leaves with its toast.
    await step(() => {
      api.current!.toast.info('One');
      api.current!.toast.info('Two');
    });
    expect([status.textContent, alert.textContent]).toEqual(['OneTwo', '']);
    await step(() => api.current!.clear());
    expect(status.textContent).toBe('');
  });

  it('gives toasts without their own duration the provider\'s, 0 keeping them until dismissed', async () => {
    const api = renderWith({ duration: 0 });
    act(() => { api.current!.toast({ title: 'kept' }); });
    act(() => { api.current!.toast({ title: 'timed', duration: 60_000 }); });
    expect(api.current!.toasts.map((t) => t.duration)).toEqual([0, 60_000]);
    expect(document.querySelectorAll('[data-pxl-toast] [aria-hidden] > div')).toHaveLength(1);
    await act(async () => {
      await api.current!.toast
        .promise(Promise.reject(new Error('no')), { loading: { title: 'Saving…' }, success: { title: 'Saved' }, error: { title: 'Failed' } })
        .catch(() => {});
    });
    expect(api.current!.toasts[2]).toMatchObject({ title: 'Failed', duration: 0 });
    cleanup();

    const slow = renderWith({ duration: 8000 });
    act(() => { slow.current!.toast({ title: 'slow' }); });
    await act(async () => {
      await slow.current!.toast
        .promise(Promise.reject(new Error('no')), { loading: { title: 'Saving…' }, success: { title: 'Saved' }, error: { title: 'Failed' } })
        .catch(() => {});
    });
    expect(slow.current!.toasts.map((t) => t.duration)).toEqual([8000, 8000]);
  });

  // Regression: an `id: undefined` passed on by the caller overwrote the
  // generated id, so the returned id could not dismiss the toast.
  it('dismisses a toast by the id it returned when the input carried id: undefined', () => {
    const api = renderWith();
    let id = '';
    act(() => { id = api.current!.toast({ id: undefined, title: 'temp' }); });
    expect(api.current!.toasts[0]!.id).toBe(id);
    act(() => { api.current!.dismiss(id); });
    expect(api.current!.toasts).toHaveLength(0);
  });
});
