import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetPage, setPageVisibility, usePreferences } from '../page';

afterEach(() => {
  resetPage();
});

describe('usePreferences', () => {
  it('answers the reduced-motion query for a reader who prefers reduced motion, and no other', () => {
    usePreferences({ reducedMotion: true });
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
    expect(window.matchMedia('(prefers-reduced-motion:reduce)').matches).toBe(true);
    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(false);
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').media).toBe('(prefers-reduced-motion: reduce)');
  });

  it('answers no for a reader who does not', () => {
    usePreferences({ reducedMotion: false });
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
  });

  it('leaves the page as it is without a preference, and resetPage takes one back', () => {
    usePreferences({});
    expect(window.matchMedia).toBeUndefined();
    usePreferences({ reducedMotion: true });
    resetPage();
    expect(window.matchMedia).toBeUndefined();
  });
});

describe('setPageVisibility', () => {
  it('hides and shows the page, firing visibilitychange each time, until resetPage', () => {
    const changes = vi.fn(() => [document.visibilityState, document.hidden]);
    document.addEventListener('visibilitychange', changes);
    setPageVisibility('hidden');
    setPageVisibility('visible');
    setPageVisibility('hidden');
    document.removeEventListener('visibilitychange', changes);
    expect(changes.mock.results.map((result) => result.value)).toEqual([
      ['hidden', true],
      ['visible', false],
      ['hidden', true],
    ]);
    resetPage();
    expect([document.visibilityState, document.hidden]).toEqual(['visible', false]);
  });
});
