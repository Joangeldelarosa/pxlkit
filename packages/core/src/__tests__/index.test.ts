import { describe, it, expect } from 'vitest';
import { isAnimatedIcon } from '../index';
import { testIcon, testAnimatedIcon } from './fixtures';

describe('isAnimatedIcon', () => {
  it('returns false for a static icon (has grid, no frames)', () => {
    expect(isAnimatedIcon(testIcon)).toBe(false);
  });

  it('returns true for an animated icon (has frames)', () => {
    expect(isAnimatedIcon(testAnimatedIcon)).toBe(true);
  });
});
