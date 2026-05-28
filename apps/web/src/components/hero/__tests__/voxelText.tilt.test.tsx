import { describe, it, expect } from 'vitest';
import { computeTilt, MAX_TILT } from '../VoxelText';

describe('computeTilt', () => {
  it('returns 0 tilt at center', () => {
    expect(computeTilt(0, 0)).toEqual({ tiltX: 0, tiltY: 0 });
  });

  it('caps at ±MAX_TILT for out-of-range inputs', () => {
    const t = computeTilt(2, -2);
    expect(Math.abs(t.tiltY)).toBeLessThanOrEqual(MAX_TILT);
    expect(Math.abs(t.tiltX)).toBeLessThanOrEqual(MAX_TILT);
  });

  it('inverts Y so mouse up = headline tilts up toward viewer', () => {
    const t = computeTilt(0, -1);
    expect(t.tiltX).toBeGreaterThan(0);
  });

  it('mouse right = tiltY positive (rotateY)', () => {
    const t = computeTilt(1, 0);
    expect(t.tiltY).toBe(MAX_TILT);
  });

  it('scales linearly within [-1, +1]', () => {
    const half = computeTilt(0.5, 0);
    expect(half.tiltY).toBeCloseTo(MAX_TILT * 0.5, 5);
  });
});
