import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lockScroll } from '../index';

describe('lockScroll', () => {
  beforeEach(() => {
    document.body.removeAttribute('style');
    document.documentElement.removeAttribute('style');
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pins the body and hides overflow while locked', () => {
    Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
    const release = lockScroll();
    const body = document.body.style;
    expect(body.overflow).toBe('hidden');
    expect(body.position).toBe('fixed');
    expect(body.top).toBe('-120px');
    expect(body.left).toBe('0px');
    expect(body.right).toBe('0px');
    expect(body.width).toBe('100%');
    expect(document.documentElement.style.scrollbarGutter).toBe('stable');
    release();
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('restores the previous inline styles and scroll position on release', () => {
    Object.defineProperty(window, 'scrollY', { value: 64, configurable: true });
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';
    const release = lockScroll();
    release();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.top).toBe('');
    expect(document.documentElement.style.scrollbarGutter).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 64);
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('stacks locks and unlocks only after the last release', () => {
    document.body.style.overflow = 'scroll';
    const releaseA = lockScroll();
    const releaseB = lockScroll();
    releaseA();
    expect(document.body.style.overflow).toBe('hidden');
    releaseB();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('ignores repeated releases of the same lock', () => {
    document.body.style.overflow = 'scroll';
    const releaseA = lockScroll();
    const releaseB = lockScroll();
    releaseA();
    releaseA();
    expect(document.body.style.overflow).toBe('hidden');
    releaseB();
    expect(document.body.style.overflow).toBe('scroll');
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('locks a document without a window (DOM shims), leaving the scroll position alone', () => {
    const scrollTo = window.scrollTo;
    document.body.style.overflow = 'scroll';
    vi.stubGlobal('window', undefined);
    try {
      const release = lockScroll();
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.position).toBe('fixed');
      release();
      expect(document.body.style.overflow).toBe('scroll');
      expect(document.body.style.position).toBe('');
    } finally {
      vi.unstubAllGlobals();
    }
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('does nothing without a document (server rendering)', () => {
    vi.stubGlobal('document', undefined);
    const release = lockScroll();
    vi.unstubAllGlobals();
    release();
    expect(document.body.style.overflow).toBe('');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
