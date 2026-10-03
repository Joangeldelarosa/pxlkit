import { describe, expect, it } from 'vitest';
import { toneMap, type Size, type Tone } from '../../../common';
import { badgeVariantClasses, type PixelBadgeVariant } from '../../../components/data/badge';
import { chipClasses, chipDeleteLabel, chipSizeClasses } from '../../../components/data/chip';

const TONES = Object.keys(toneMap) as Tone[];
const VARIANTS: PixelBadgeVariant[] = ['soft', 'solid', 'outline', 'ghost'];
const SIZES: Size[] = ['sm', 'md', 'lg'];
const classesOf = (value: string) => value.split(' ');

describe('chip recipes', () => {
  it('shares the badge variant axis', () => {
    for (const variant of VARIANTS) {
      for (const tone of TONES) {
        const { root } = chipClasses('pixel', { tone, variant, size: 'md', interactive: false });
        expect(classesOf(root)).toEqual(expect.arrayContaining(classesOf(badgeVariantClasses(variant, tone))));
      }
    }
  });

  it('scales padding, type size and gap with the size', () => {
    for (const size of SIZES) {
      const { root } = chipClasses('pixel', { tone: 'cyan', variant: 'soft', size, interactive: false });
      expect(classesOf(root)).toEqual(expect.arrayContaining(classesOf(chipSizeClasses[size])));
    }
    expect(new Set(SIZES.map((size) => chipSizeClasses[size])).size).toBe(SIZES.length);
  });

  it('adds hover and a focus ring in the tone only to a clickable chip', () => {
    const still = classesOf(chipClasses('pixel', { tone: 'gold', variant: 'soft', size: 'md', interactive: false }).root);
    const clickable = classesOf(chipClasses('pixel', { tone: 'gold', variant: 'soft', size: 'md', interactive: true }).root);
    expect(still).not.toContain('cursor-pointer');
    expect(clickable).toEqual(
      expect.arrayContaining(['cursor-pointer', toneMap.gold.hover, toneMap.gold.ring, 'focus-visible:ring-2', 'focus-visible:outline-hidden']),
    );
  });

  it('frames the chip and its delete button per surface, ringing the button in the tone', () => {
    const pixel = chipClasses('pixel', { tone: 'red', variant: 'soft', size: 'md', interactive: false });
    const linear = chipClasses('linear', { tone: 'red', variant: 'soft', size: 'md', interactive: false });
    expect(classesOf(pixel.root)).toEqual(expect.arrayContaining(['border-2', 'pxl-corner-sm', 'font-mono']));
    expect(classesOf(linear.root)).toEqual(expect.arrayContaining(['border', 'rounded-md', 'font-sans']));
    expect(classesOf(pixel.deleteButton)).toEqual(expect.arrayContaining([toneMap.red.ring, 'focus-visible:outline-hidden', 'pxl-corner-sm']));
    expect(classesOf(linear.deleteButton)).toContain('rounded-md');
    expect(pixel.icon).toBe('inline-flex items-center shrink-0');
    expect(pixel.deleteIcon).toBe('h-2 w-2');
  });

  it('splits the padding of a clickable deletable chip between its frame and its action', () => {
    for (const size of SIZES) {
      const { frame, action } = chipClasses('pixel', { tone: 'cyan', variant: 'soft', size, interactive: true });
      const [px, py, text, gap, tracking] = classesOf(chipSizeClasses[size]);
      const step = px!.slice('px-'.length);
      expect(classesOf(frame)).toEqual(
        expect.arrayContaining([
          `pr-${step}`,
          text,
          gap,
          tracking,
          'inline-flex',
          'border-2',
          'pxl-corner-sm',
          'font-mono',
          ...classesOf(badgeVariantClasses('soft', 'cyan')),
        ]),
      );
      expect(classesOf(frame).filter((c) => /^(px|pl|py)-/.test(c))).toEqual([]);
      expect(classesOf(action)).toEqual(
        expect.arrayContaining([`pl-${step}`, py, gap, 'inline-flex', 'items-center', 'bg-transparent', 'border-0', 'm-0', '[font:inherit]', 'text-inherit']),
      );
      expect(classesOf(action).filter((c) => /^(px-|pr-|border-2$|text-(xs|sm|\[))/.test(c))).toEqual([]);
    }
  });

  it("rings the frame in the chip's tone while its action has keyboard focus, keeping the hover tint", () => {
    for (const tone of TONES) {
      const { frame, action } = chipClasses('linear', { tone, variant: 'outline', size: 'md', interactive: true });
      expect(classesOf(frame)).toEqual(
        expect.arrayContaining([
          'has-[[data-chip-action]:focus-visible]:ring-2',
          'has-[[data-chip-action]:focus-visible]:ring-offset-2',
          'has-[[data-chip-action]:focus-visible]:ring-offset-retro-bg',
          toneMap[tone].ring.replace('focus-visible:', 'has-[[data-chip-action]:focus-visible]:'),
          toneMap[tone].hover,
          'cursor-pointer',
          'rounded-md',
        ]),
      );
      expect(classesOf(action)).toEqual(expect.arrayContaining(['focus-visible:outline-hidden', 'cursor-pointer']));
      expect(classesOf(action).filter((c) => c.includes('ring'))).toEqual([]);
    }
  });

  it('lights up the frame inside its cut corners on the pixel surface while its action has keyboard focus', () => {
    for (const tone of TONES) {
      const { frame } = chipClasses('pixel', { tone, variant: 'outline', size: 'md', interactive: true });
      expect(classesOf(frame)).toEqual(expect.arrayContaining(['pxl-corner-sm', 'has-[[data-chip-action]:focus-visible]:pxl-focus-inset']));
      expect(classesOf(frame).filter((c) => c.includes('ring'))).toEqual([]);
    }
  });

  it('names the delete button after the chip', () => {
    expect(chipDeleteLabel('React')).toBe('Remove React');
  });
});
