import { afterEach, describe, expect, it, vi } from 'vitest';
import { REDUCED_MOTION_QUERY, matchesMediaQuery, subscribeMediaQuery } from '../index';
import { installMatchMedia } from './match-media';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('matchesMediaQuery', () => {
  it('reads matchMedia', () => {
    installMatchMedia((query) => query === REDUCED_MOTION_QUERY);
    expect(matchesMediaQuery(REDUCED_MOTION_QUERY)).toBe(true);
    expect(matchesMediaQuery('(min-width: 1px)', true)).toBe(false);
  });

  it('falls back without matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
    expect(matchesMediaQuery('(min-width: 1px)')).toBe(false);
    expect(matchesMediaQuery('(min-width: 1px)', true)).toBe(true);
  });

  it('falls back on the server', () => {
    vi.stubGlobal('window', undefined);
    expect(matchesMediaQuery('(min-width: 1px)', true)).toBe(true);
  });
});

describe('subscribeMediaQuery', () => {
  it('reports changes until unsubscribed', () => {
    const lists = installMatchMedia(() => false);
    const changes: boolean[] = [];
    const unsubscribe = subscribeMediaQuery('(min-width: 768px)', (matches) => changes.push(matches));
    lists[0]!.fire(true);
    lists[0]!.fire(false);
    unsubscribe();
    expect(lists[0]!.listenerCount()).toBe(0);
    lists[0]!.fire(true);
    expect(changes).toEqual([true, false]);
  });

  it('uses the legacy listener API when that is all there is', () => {
    const lists = installMatchMedia(() => false, { legacy: true });
    const changes: boolean[] = [];
    const unsubscribe = subscribeMediaQuery('(min-width: 768px)', (matches) => changes.push(matches));
    lists[0]!.fire(true);
    unsubscribe();
    expect(lists[0]!.listenerCount()).toBe(0);
    expect(changes).toEqual([true]);
  });

  it('is a no-op without matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined });
    const unsubscribe = subscribeMediaQuery('(min-width: 768px)', () => {});
    expect(unsubscribe).toBeTypeOf('function');
    unsubscribe();
  });
});
