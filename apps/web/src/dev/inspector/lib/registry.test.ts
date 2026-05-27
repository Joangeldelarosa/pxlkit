import { describe, it, expect } from 'vitest';
import { getPacks, getPackById, findIcon, allIcons } from './registry';

describe('icon registry', () => {
  it('exposes the six static icon packs', () => {
    const ids = getPacks()
      .map((p) => p.id)
      .sort();
    expect(ids).toEqual(['effects', 'feedback', 'gamification', 'social', 'ui', 'weather']);
  });

  it('every pack has a non-empty icons array', () => {
    for (const p of getPacks()) {
      expect(p.icons.length).toBeGreaterThan(0);
    }
  });

  it('getPackById resolves a hit and returns undefined on a miss', () => {
    expect(getPackById('gamification')?.id).toBe('gamification');
    expect(getPackById('nope')).toBeUndefined();
  });

  it('findIcon resolves a known icon and misses an unknown one', () => {
    const pack = getPackById('gamification')!;
    const first = pack.icons[0]!;
    expect(findIcon('gamification', first.name)?.name).toBe(first.name);
    expect(findIcon('gamification', '___nope___')).toBeUndefined();
    expect(findIcon('nope', first.name)).toBeUndefined();
  });

  it('allIcons flattens every pack icon tagged with its pack id', () => {
    const total = getPacks().reduce((n, p) => n + p.icons.length, 0);
    const flat = allIcons();
    expect(flat).toHaveLength(total);
    expect(flat.every((e) => typeof e.pack === 'string' && !!e.icon)).toBe(true);
  });
});
