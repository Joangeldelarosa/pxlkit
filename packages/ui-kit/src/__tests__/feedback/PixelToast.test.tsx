import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { PxlKitToastProvider, useToast } from '../../toast';

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

describe('PixelToast / useToast (upgraded)', () => {
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

  describe('shortcuts', () => {
    it('toast.success / error / info / warning / loading push with the right tone', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );

      act(() => {
        apiRef.current!.toast.success('ok', 'all good');
        apiRef.current!.toast.error('fail');
        apiRef.current!.toast.info('fyi');
        apiRef.current!.toast.warning('careful');
        apiRef.current!.toast.loading('working');
      });

      const items = apiRef.current!.toasts;
      expect(items).toHaveLength(5);
      expect(items[0].tone).toBe('green');
      expect(items[0].title).toBe('ok');
      expect(items[0].message).toBe('all good');
      expect(items[1].tone).toBe('red');
      expect(items[2].tone).toBe('cyan');
      expect(items[3].tone).toBe('gold');
      expect(items[4].tone).toBe('cyan');
      expect(items[4].loading).toBe(true);
      expect(items[4].duration).toBe(0);
    });

    it('shortcut accepts an input object too', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );
      act(() => {
        apiRef.current!.toast.success({ title: 'saved', message: 'row 42', duration: 1000 });
      });
      const t = apiRef.current!.toasts[0];
      expect(t.tone).toBe('green');
      expect(t.message).toBe('row 42');
      expect(t.duration).toBe(1000);
    });

    it('returns ids that can be dismissed', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );
      let id = '';
      act(() => {
        id = apiRef.current!.toast.info('hi');
      });
      expect(apiRef.current!.toasts).toHaveLength(1);
      act(() => { apiRef.current!.dismiss(id); });
      expect(apiRef.current!.toasts).toHaveLength(0);
    });
  });

  describe('update()', () => {
    it('merges patch into the matching toast', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );

      let id = '';
      act(() => {
        id = apiRef.current!.toast.loading('working');
      });
      expect(apiRef.current!.toasts[0].loading).toBe(true);

      act(() => {
        apiRef.current!.update(id, { title: 'done', tone: 'green', loading: false, duration: 2000 });
      });

      const t = apiRef.current!.toasts[0];
      expect(t.title).toBe('done');
      expect(t.tone).toBe('green');
      expect(t.loading).toBe(false);
      expect(t.duration).toBe(2000);
    });

    it('toast.update is the same function as the returned update()', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );
      expect(apiRef.current!.toast.update).toBe(apiRef.current!.update);
    });

    it('is a no-op when the id is unknown', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );
      act(() => {
        apiRef.current!.toast.info('hi');
        apiRef.current!.update('nope', { title: 'x' });
      });
      expect(apiRef.current!.toasts[0].title).toBe('hi');
    });
  });

  describe('promise()', () => {
    it('flips loading → success on resolve and returns the value', async () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );

      let deferredResolve!: (v: number) => void;
      const p = new Promise<number>((res) => { deferredResolve = res; });

      let outcome: Promise<number>;
      act(() => {
        outcome = apiRef.current!.toast.promise(p, {
          loading: { title: 'saving…' },
          success: (v) => ({ title: `saved #${v}` }),
          error: { title: 'oops' },
        });
      });

      // Loading state.
      expect(apiRef.current!.toasts).toHaveLength(1);
      expect(apiRef.current!.toasts[0].title).toBe('saving…');
      expect(apiRef.current!.toasts[0].loading).toBe(true);
      expect(apiRef.current!.toasts[0].tone).toBe('cyan');

      await act(async () => {
        deferredResolve(42);
        const v = await outcome!;
        expect(v).toBe(42);
      });

      await waitFor(() => {
        const t = apiRef.current!.toasts[0];
        expect(t.title).toBe('saved #42');
        expect(t.tone).toBe('green');
        expect(t.loading).toBe(false);
      });
    });

    it('flips loading → error on reject and re-throws', async () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );

      const err = new Error('boom');
      let deferredReject!: (e: Error) => void;
      const p = new Promise<number>((_res, rej) => { deferredReject = rej; });

      let outcome: Promise<number>;
      act(() => {
        outcome = apiRef.current!.toast.promise(p, {
          loading: { title: 'saving…' },
          success: { title: 'saved' },
          error: (e) => ({ title: 'failed', message: (e as Error).message }),
        });
      });

      expect(apiRef.current!.toasts[0].loading).toBe(true);

      await act(async () => {
        deferredReject(err);
        await expect(outcome!).rejects.toBe(err);
      });

      await waitFor(() => {
        const t = apiRef.current!.toasts[0];
        expect(t.title).toBe('failed');
        expect(t.message).toBe('boom');
        expect(t.tone).toBe('red');
        expect(t.loading).toBe(false);
      });
    });

    it('also accepts a factory `() => Promise`', async () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );

      let outcome: Promise<string>;
      act(() => {
        outcome = apiRef.current!.toast.promise(() => Promise.resolve('hello'), {
          loading: { title: 'loading' },
          success: { title: 'done' },
          error: { title: 'err' },
        });
      });

      await act(async () => {
        const v = await outcome!;
        expect(v).toBe('hello');
      });

      await waitFor(() => {
        expect(apiRef.current!.toasts[0].title).toBe('done');
        expect(apiRef.current!.toasts[0].tone).toBe('green');
      });
    });
  });

  describe('viewport / stacked visual', () => {
    it('renders newest toast with role=status and respects assertive tones', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );
      act(() => {
        apiRef.current!.toast.error('boom');
      });
      // tone=red → assertive role=alert with aria-live=assertive
      const alert = screen.getByRole('alert');
      expect(alert).toBeTruthy();
      expect(alert.getAttribute('aria-live')).toBe('assertive');
    });

    it('viewport carries stacked + expanded data attributes', () => {
      render(
        <PxlKitToastProvider>
          <div />
        </PxlKitToastProvider>,
      );
      const viewport = document.querySelector('[data-pxl-toast-viewport]') as HTMLElement;
      expect(viewport).toBeTruthy();
      expect(viewport.getAttribute('data-stacked')).toBe('true');
      expect(viewport.getAttribute('data-expanded')).toBe('false');
    });
  });
});
