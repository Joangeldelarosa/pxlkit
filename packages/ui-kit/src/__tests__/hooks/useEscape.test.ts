import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEscape } from '../../hooks/useEscape';

function dispatchKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

describe('useEscape', () => {
  it('fires handler on Escape when enabled', () => {
    const handler = vi.fn();
    renderHook(() => useEscape(handler));
    dispatchKey('Escape');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toBeInstanceOf(KeyboardEvent);
  });

  it('does not fire when enabled=false', () => {
    const handler = vi.fn();
    renderHook(() => useEscape(handler, false));
    dispatchKey('Escape');
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire for non-Escape keys', () => {
    const handler = vi.fn();
    renderHook(() => useEscape(handler));
    dispatchKey('Enter');
    dispatchKey('a');
    dispatchKey(' ');
    expect(handler).not.toHaveBeenCalled();
  });
});
