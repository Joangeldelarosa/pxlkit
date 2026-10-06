import { describe, expect, it } from 'vitest';
import {
  heroMediaBodyClasses,
  heroMediaCaptionClasses,
  heroMediaClasses,
  heroMediaRatios,
  surfaceClasses,
  tone,
} from '../../../index';

describe('hero media recipes', () => {
  it('spells out the aspect ratio of every preset', () => {
    expect(heroMediaRatios).toEqual({ '1/1': '1 / 1', '4/5': '4 / 5', '16/10': '16 / 10', '16/9': '16 / 9' });
  });

  it('centres the figure, or sets it on the end of its row next to a headline', () => {
    const base = 'relative flex w-full flex-col overflow-hidden';
    expect(heroMediaClasses('pixel', { anchor: 'center', framed: false, tone: 'cyan' })).toBe(`${base} self-center`);
    expect(heroMediaClasses('pixel', { anchor: 'baseline-headline', framed: false, tone: 'cyan' })).toBe(
      `${base} self-end`,
    );
  });

  it('frames the figure with the surface border and radius in the tone border colour', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(heroMediaClasses(surface, { anchor: 'center', framed: true, tone: 'purple' })).toBe(
        `relative flex w-full flex-col overflow-hidden self-center ${s.border} ${s.radiusLg} ${tone.purple.border}`,
      );
    }
  });

  it('fills the figure with the media and sets the caption in the surface font', () => {
    expect(heroMediaBodyClasses).toBe('relative w-full flex-1');
    expect(heroMediaCaptionClasses('pixel')).toBe('mt-3 text-xs text-retro-muted font-mono');
    expect(heroMediaCaptionClasses('linear')).toBe('mt-3 text-xs text-retro-muted font-sans');
  });
});
