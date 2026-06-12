import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
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
