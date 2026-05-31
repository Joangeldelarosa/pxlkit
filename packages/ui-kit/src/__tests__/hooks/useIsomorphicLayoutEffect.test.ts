import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect, useLayoutEffect } from 'react';

describe('useIsomorphicLayoutEffect', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('is defined as a function', async () => {
    const mod = await import('../../hooks/useIsomorphicLayoutEffect');
    expect(typeof mod.useIsomorphicLayoutEffect).toBe('function');
  });

  it('matches useEffect when window is undefined (mocked)', async () => {
    const originalWindow = globalThis.window;
    // Simulate SSR by deleting window before module load
    // @ts-expect-error - intentionally removing window to simulate SSR
    delete globalThis.window;
    try {
      const mod = await import('../../hooks/useIsomorphicLayoutEffect');
      expect(mod.useIsomorphicLayoutEffect).toBe(useEffect);
      expect(mod.useIsomorphicLayoutEffect).not.toBe(useLayoutEffect);
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
