import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { PixelToast, PxlKitToastProvider, useToast } from '../../toast';

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

      const t = apiRef.current!.toasts[0];
      expect(t.title).toBe('saved #42');
      expect(t.tone).toBe('green');
      expect(t.loading).toBe(false);
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

      const t = apiRef.current!.toasts[0];
      expect(t.title).toBe('failed');
      expect(t.message).toBe('boom');
      expect(t.tone).toBe('red');
      expect(t.loading).toBe(false);
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

      expect(apiRef.current!.toasts[0].title).toBe('done');
      expect(apiRef.current!.toasts[0].tone).toBe('green');
    });
  });

  describe('viewport / stacked visual', () => {
    // Regression: each card was its own live region, inserted already filled
    // (read unreliably) and re-reading its buttons' labels (aria-atomic).
    it('announces critical tones in the assertive region, the card being no live region', () => {
      const { apiRef, Capture } = makeHarness();
      render(
        <PxlKitToastProvider>
          <Capture />
        </PxlKitToastProvider>,
      );
      act(() => {
        apiRef.current!.toast.error('boom', 'Upload failed.');
      });
      // tone=red → the role=alert region of the viewport, assertive.
      expect(screen.getByRole('alert').textContent).toBe('boom Upload failed.');
      expect(screen.getByRole('status').textContent).toBe('');
      const card = document.querySelector('[data-pxl-toast]')!;
      expect(['role', 'aria-live', 'aria-atomic'].map((name) => card.getAttribute(name))).toEqual([null, null, null]);
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

describe('PixelToast — auto-dismiss countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const bar = (card: HTMLElement) => card.querySelector<HTMLElement>('[aria-hidden] > div')!;
  const card = () => document.querySelector<HTMLElement>('[data-pxl-toast]')!;

  it('dismisses once its duration has passed', () => {
    const onDismiss = vi.fn();
    render(<PixelToast toast={{ id: 't', title: 'Saved', duration: 1000 }} onDismiss={onDismiss} />);
    act(() => { vi.advanceTimersByTime(999); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  // Regression: entering the paused state twice (hover, then focus) counted the
  // paused time again, and the pointer leaving resumed the countdown while
  // focus was still inside — the toast then closed under the focused action.
  it('holds still until both the pointer and focus have left, losing no time meanwhile', () => {
    const onDismiss = vi.fn();
    render(
      <PixelToast
        toast={{ id: 't', title: 'Deleted', duration: 4500, action: <button type="button">Undo</button> }}
        onDismiss={onDismiss}
      />,
    );
    const undo = screen.getByRole('button', { name: 'Undo' });
    act(() => { vi.advanceTimersByTime(1000); });
    fireEvent.mouseEnter(card());
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => { undo.focus(); });
    act(() => { vi.advanceTimersByTime(5000); });
    fireEvent.mouseLeave(card());
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(bar(card()).style.width).toBe(`${(3500 / 4500) * 100}%`);

    act(() => { undo.blur(); });
    expect(bar(card()).style.transitionDuration).toBe('3500ms');
    act(() => { vi.advanceTimersByTime(3499); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps still while focus moves between its buttons', () => {
    const onDismiss = vi.fn();
    render(
      <PixelToast toast={{ id: 't', title: 'Deleted', duration: 1000, action: <button type="button">Undo</button> }} onDismiss={onDismiss} />,
    );
    act(() => { screen.getByRole('button', { name: 'Undo' }).focus(); });
    act(() => { screen.getByRole('button', { name: 'Dismiss notification' }).focus(); });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  // Regression: the bar was rendered empty and only showed after a pause.
  it('starts with a full bar that shrinks over the duration once on the page', () => {
    const html = renderToString(<PixelToast toast={{ id: 't', title: 'Saved', duration: 4500 }} onDismiss={() => {}} />);
    expect(html).toContain('style="width:100%;transition-duration:0ms"');
    render(<PixelToast toast={{ id: 't', title: 'Saved', duration: 4500 }} onDismiss={() => {}} />);
    const { width, transitionDuration } = bar(card()).style;
    expect([width, transitionDuration]).toEqual(['0%', '4500ms']);
  });

  // Regression: after loading → success the bar kept the loading toast's 0 ms.
  it('counts down the new duration once a loading toast settles', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<PixelToast toast={{ id: 't', title: 'Saving…', loading: true }} onDismiss={onDismiss} />);
    expect(card().querySelector('[aria-hidden] > div')).toBeNull();
    act(() => { vi.advanceTimersByTime(10_000); });
    rerender(<PixelToast toast={{ id: 't', title: 'Saved', loading: false, duration: 4500, tone: 'green' }} onDismiss={onDismiss} />);
    expect(bar(card()).style.transitionDuration).toBe('4500ms');
    act(() => { vi.advanceTimersByTime(4500); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  // Regression: a toast ran out while nobody looked at the page (WCAG 2.2.1).
  it('holds still while the page is hidden or the window in the background, until both come back', () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    const onDismiss = vi.fn();
    render(<PixelToast toast={{ id: 't', title: 'Saved', duration: 4500 }} onDismiss={onDismiss} />);
    act(() => { vi.advanceTimersByTime(1000); });
    hidden.mockReturnValue(true);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    act(() => { window.dispatchEvent(new FocusEvent('blur')); });
    hidden.mockReturnValue(false);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(bar(card()).style.width).toBe(`${(3500 / 4500) * 100}%`);

    act(() => { window.dispatchEvent(new FocusEvent('focus')); });
    expect(bar(card()).style.transitionDuration).toBe('3500ms');
    act(() => { vi.advanceTimersByTime(3500); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('waits for a hidden page to come back before counting down', () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const onDismiss = vi.fn();
    render(<PixelToast toast={{ id: 't', title: 'Saved', duration: 1000 }} onDismiss={onDismiss} />);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(bar(card()).style.width).toBe('100%');
    hidden.mockReturnValue(false);
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
