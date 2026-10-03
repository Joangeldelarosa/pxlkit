import { afterEach, describe, expect, it, vi } from 'vitest';
import { elapse, useRealTime, useSimulatedTime } from '../clock';

const DAY = 24 * 60 * 60 * 1000;

afterEach(() => {
  useRealTime();
  vi.restoreAllMocks();
});

describe('useSimulatedTime', () => {
  it('starts every recording at the same instant, even past midnight on the wall clock', async () => {
    useSimulatedTime();
    const first = new Date();
    await elapse(5000);
    useRealTime();
    // The run goes on into the next day before the second recording starts.
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + DAY);
    useSimulatedTime();
    expect(new Date()).toEqual(first);
    expect(new Date().toDateString()).toBe(first.toDateString());
  });
});
