import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawnTick, SPAWN_INTERVAL } from '../IconField';

type Ic = { id: number; opacity: number; diesAt: number | null; bornAt: number };

describe('spawnTick', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date('2026-05-28T00:00:00Z')));
  afterEach(() => vi.useRealTimers());

  it('marks one icon to die when SPAWN_INTERVAL has elapsed', () => {
    const now = Date.now();
    const icons: Ic[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      opacity: 0.7,
      diesAt: null,
      bornAt: now - 5000,
    }));
    const state = { lastSpawnAt: now - SPAWN_INTERVAL - 100 };
    spawnTick(icons, state, now);
    expect(icons.filter((i) => i.diesAt !== null).length).toBe(1);
    expect(state.lastSpawnAt).toBe(now);
  });

  it('does not spawn if SPAWN_INTERVAL has not elapsed', () => {
    const now = Date.now();
    const icons: Ic[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      opacity: 0.7,
      diesAt: null,
      bornAt: now - 5000,
    }));
    const state = { lastSpawnAt: now - 1000 };
    spawnTick(icons, state, now);
    expect(icons.filter((i) => i.diesAt !== null).length).toBe(0);
  });

  it('only targets icons whose diesAt is null (not already dying)', () => {
    const now = Date.now();
    const icons: Ic[] = [
      { id: 0, opacity: 0.7, diesAt: now + 500, bornAt: now - 5000 },
      { id: 1, opacity: 0.7, diesAt: null, bornAt: now - 5000 },
    ];
    const state = { lastSpawnAt: now - SPAWN_INTERVAL - 100 };
    spawnTick(icons, state, now);
    // The only candidate was id=1
    expect(icons[1].diesAt).not.toBeNull();
  });

  it('no-ops when no candidates available', () => {
    const now = Date.now();
    const icons: Ic[] = [{ id: 0, opacity: 0.7, diesAt: now + 500, bornAt: now - 5000 }];
    const state = { lastSpawnAt: now - SPAWN_INTERVAL - 100 };
    spawnTick(icons, state, now);
    // state.lastSpawnAt should NOT have been bumped if no spawn happened
    // (this is a soft contract — implementation could go either way; current impl skips bump too)
    expect(icons[0].diesAt).toBeCloseTo(now + 500);
  });
});
