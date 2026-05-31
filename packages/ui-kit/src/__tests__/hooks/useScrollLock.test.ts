// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollLock } from '../../hooks/useScrollLock';

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.documentElement.style.scrollbarGutter = '';
  });

  it('sets body overflow to hidden when active becomes true', () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
  });

  it('restores body overflow when active becomes false', () => {
    document.body.style.overflow = 'auto';
    const { rerender, unmount } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: true } },
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender({ active: false });
    expect(document.body.style.overflow).toBe('auto');
    unmount();
  });

  it('two locks stacked: only restores after both deactivate', () => {
    document.body.style.overflow = 'scroll';

    const lockA = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: true } },
    );
    expect(document.body.style.overflow).toBe('hidden');

    const lockB = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: true } },
    );
    expect(document.body.style.overflow).toBe('hidden');

    lockA.rerender({ active: false });
    expect(document.body.style.overflow).toBe('hidden');

    lockB.rerender({ active: false });
    expect(document.body.style.overflow).toBe('scroll');

    lockA.unmount();
    lockB.unmount();
  });
});
