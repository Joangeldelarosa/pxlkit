import { describe, expect, it } from 'vitest';
import { computeDigestHash } from '../generate-skill-refs';

describe('computeDigestHash', () => {
  it('is stable across key ordering', () => {
    const a = computeDigestHash({ tokens: 'x', registry: 'y' });
    const b = computeDigestHash({ registry: 'y', tokens: 'x' });
    expect(a).toBe(b);
  });

  it('changes when any input changes', () => {
    const a = computeDigestHash({ tokens: 'x', registry: 'y' });
    const b = computeDigestHash({ tokens: 'x', registry: 'z' });
    expect(a).not.toBe(b);
  });
});
