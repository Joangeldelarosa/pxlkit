import { describe, it, expect } from 'vitest';
import {
  containerWidth,
  pageGutter,
  sectionRhythm,
  stackGap,
  rhythm,
  tone,
} from '../tokens';

describe('tokens', () => {
  it('containerWidth has 12 keys including prose and full', () => {
    const keys = Object.keys(containerWidth);
    expect(keys).toHaveLength(12);
    expect(keys).toContain('prose');
    expect(keys).toContain('full');
  });

  it('pageGutter contains 5 keys 0/sm/md/lg/xl', () => {
    const keys = Object.keys(pageGutter);
    expect(keys).toHaveLength(5);
    expect(keys).toEqual(expect.arrayContaining(['0', 'sm', 'md', 'lg', 'xl']));
  });

  it('sectionRhythm.xl matches py-20 sm:py-28 lg:py-32', () => {
    expect(sectionRhythm.xl).toBe('py-20 sm:py-28 lg:py-32');
  });

  it('stackGap.4 equals gap-4', () => {
    expect(stackGap[4]).toBe('gap-4');
  });

  it('rhythm.eyebrowToHeadline equals mt-5', () => {
    expect(rhythm.eyebrowToHeadline).toBe('mt-5');
  });

  it('tone.neutral and tone.green and tone.cyan and tone.gold and tone.red and tone.purple and tone.pink each have border/bg/soft/glow/ring/text/fill keys', () => {
    const requiredKeys = ['border', 'bg', 'soft', 'glow', 'ring', 'text', 'fill'];
    const toneNames = ['neutral', 'green', 'cyan', 'gold', 'red', 'purple', 'pink'] as const;
    for (const name of toneNames) {
      const entry = tone[name] as Record<string, string>;
      for (const key of requiredKeys) {
        expect(entry).toHaveProperty(key);
        expect(typeof entry[key]).toBe('string');
      }
    }
  });

  it('every non-neutral tone entry contains /18 in bg and /8 in soft', () => {
    const nonNeutral = ['green', 'cyan', 'gold', 'red', 'purple', 'pink'] as const;
    for (const name of nonNeutral) {
      const entry = tone[name];
      expect(entry.bg).toContain('/18');
      expect(entry.soft).toContain('/8');
    }
  });
});
