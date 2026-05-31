import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventListener } from '../../hooks/useEventListener';

describe('useEventListener', () => {
  it('attaches and fires on window click', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));
    window.dispatchEvent(new MouseEvent('click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('detaches on unmount (no fire after unmount)', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener('click', handler));
    unmount();
    window.dispatchEvent(new MouseEvent('click'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not crash when target is null', () => {
    const handler = vi.fn();
    expect(() => {
      renderHook(() => useEventListener('click', handler, null));
    }).not.toThrow();
    window.dispatchEvent(new MouseEvent('click'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('updates internal ref when listener prop changes without re-subscribing', () => {
    const first = vi.fn();
    const second = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { rerender } = renderHook(
      ({ fn }: { fn: (e: MouseEvent) => void }) => useEventListener('click', fn),
      { initialProps: { fn: first as (e: MouseEvent) => void } },
    );

    const addCountAfterMount = addSpy.mock.calls.filter((c) => c[0] === 'click').length;
    const removeCountAfterMount = removeSpy.mock.calls.filter((c) => c[0] === 'click').length;

    rerender({ fn: second as (e: MouseEvent) => void });

    const addCountAfterRerender = addSpy.mock.calls.filter((c) => c[0] === 'click').length;
    const removeCountAfterRerender = removeSpy.mock.calls.filter((c) => c[0] === 'click').length;

    expect(addCountAfterRerender).toBe(addCountAfterMount);
    expect(removeCountAfterRerender).toBe(removeCountAfterMount);

    window.dispatchEvent(new MouseEvent('click'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
