import { describe, expect, it } from 'vitest';
import {
  badgeSizeClasses,
  badgeVariantClasses,
  toneMap,
  type PixelBadgeVariant,
  type Size,
  type Tone,
} from '../index';

const TONES: Tone[] = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'];
const VARIANTS: PixelBadgeVariant[] = ['soft', 'solid', 'outline', 'ghost'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

const classesOf = (value: string) => value.split(' ');

describe('badge recipes', () => {
  it('paints the soft variant with the tinted fill, the border and the tone text', () => {
    for (const tone of TONES) {
      const t = toneMap[tone];
      expect(badgeVariantClasses('soft', tone)).toBe(`${t.soft} ${t.border} ${t.text}`);
    }
  });

  it('paints the solid variant with the opaque fill and readable text', () => {
    // Light text only on the dark fills; every other fill takes the page background colour.
    const lightText: Tone[] = ['purple', 'red'];
    for (const tone of TONES) {
      const t = toneMap[tone];
      const text = lightText.includes(tone) ? 'text-retro-text' : 'text-retro-bg';
      expect(badgeVariantClasses('solid', tone)).toBe(`${t.fill} ${t.border} ${text}`);
    }
  });

  it('keeps the outline and ghost variants transparent', () => {
    for (const tone of TONES) {
      const t = toneMap[tone];
      expect(badgeVariantClasses('outline', tone)).toBe(`bg-transparent ${t.border} ${t.text}`);
      expect(badgeVariantClasses('ghost', tone)).toBe(`bg-transparent border-transparent ${t.text}`);
    }
  });

  it('falls back to the soft variant for a value outside the axis', () => {
    expect(badgeVariantClasses('unknown' as PixelBadgeVariant, 'cyan')).toBe(badgeVariantClasses('soft', 'cyan'));
  });

  it('never repeats a class within a variant', () => {
    for (const variant of VARIANTS) {
      for (const tone of TONES) {
        const classes = classesOf(badgeVariantClasses(variant, tone));
        expect(new Set(classes).size).toBe(classes.length);
      }
    }
  });

  it('scales padding, type size and gap with the size', () => {
    for (const size of SIZES) {
      const classes = classesOf(badgeSizeClasses[size]);
      expect(classes.some((c) => c.startsWith('px-'))).toBe(true);
      expect(classes.some((c) => c.startsWith('py-'))).toBe(true);
      expect(classes.some((c) => c.startsWith('text-'))).toBe(true);
      expect(classes.some((c) => c.startsWith('gap-'))).toBe(true);
    }
    expect(new Set(SIZES.map((size) => badgeSizeClasses[size])).size).toBe(SIZES.length);
  });
});
