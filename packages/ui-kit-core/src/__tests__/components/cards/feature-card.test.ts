import { describe, expect, it } from 'vitest';
import {
  featureCardClasses,
  featureCardDescriptionLinesClasses,
  featureCardIconSizeClasses,
  surfaceClasses,
  tone,
  type FeatureCardOptions,
} from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);
const BASE: FeatureCardOptions = {
  tone: 'neutral',
  orientation: 'vertical',
  bordered: true,
  interactive: false,
  iconSize: 56,
};

describe('feature card recipes', () => {
  it('stacks a bordered card, or sets the icon beside the text', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(featureCardClasses(surface, BASE).root).toBe(
        `relative p-5 flex flex-col ${s.border} ${s.radiusLg} ${s.transition} border-retro-border bg-retro-surface/40`,
      );
    }
    const horizontal = featureCardClasses('pixel', { ...BASE, orientation: 'horizontal' });
    expect(classesOf(horizontal.root)).toEqual(expect.arrayContaining(['grid', 'grid-cols-[auto_1fr]', 'gap-4', 'items-start']));
    expect(classesOf(horizontal.icon)).toContain('self-start');
    expect(classesOf(horizontal.badgeRow)).toContain('col-span-2');
    expect(horizontal.footer).toBe('');
    const vertical = featureCardClasses('pixel', BASE);
    expect(classesOf(vertical.icon)).toContain('mb-4');
    expect(vertical.footer).toBe('mt-4');
    expect(vertical.spacer).toBe('flex-1');
    expect(vertical.column).toBe('min-w-0 flex flex-col');
  });

  it('drops the chrome when not bordered, and lifts and rings focus when interactive', () => {
    expect(featureCardClasses('linear', { ...BASE, bordered: false }).root).toBe(
      `relative p-5 flex flex-col ${surfaceClasses('linear').transition}`,
    );
    for (const surface of ['pixel', 'linear'] as const) {
      const interactive = classesOf(featureCardClasses(surface, { ...BASE, interactive: true }).root);
      expect(interactive).toEqual(
        expect.arrayContaining([
          'cursor-pointer',
          'hover:-translate-y-[2px]',
          'focus-visible:ring-2',
          'focus-visible:ring-retro-cyan/60',
          'focus-visible:outline-hidden',
        ]),
      );
    }
  });

  it('lifts a pixel card alone, without the drop shadow its cut corners would clip, and a linear one with its shadow', () => {
    for (const bordered of [true, false]) {
      const pixel = classesOf(featureCardClasses('pixel', { ...BASE, bordered, interactive: true }).root);
      expect(pixel).toContain('hover:-translate-y-[2px]');
      for (const shadow of ['pxl-shadow', 'pxl-shadow-hover', 'pxl-shadow-active', 'pxl-nudge-hover']) expect(pixel).not.toContain(shadow);
    }
    const linear = classesOf(featureCardClasses('linear', { ...BASE, interactive: true }).root);
    expect(linear).toEqual(expect.arrayContaining(['hover:-translate-y-[2px]', surfaceClasses('linear').shadowHover]));
  });

  it('frames the icon in the tone, at its size', () => {
    for (const size of [48, 56, 64, 80] as const) {
      const icon = featureCardClasses('pixel', { ...BASE, tone: 'gold', iconSize: size }).icon;
      expect(classesOf(icon)).toEqual(
        expect.arrayContaining([featureCardIconSizeClasses[size], 'aspect-square', tone.gold.bg, tone.gold.border, tone.gold.text]),
      );
    }
    expect(featureCardIconSizeClasses).toEqual({ 48: 'w-12', 56: 'w-14', 64: 'w-16', 80: 'w-20' });
  });

  it('keeps the badge row while hiding it without a badge, and tints the badge cyan unless told otherwise', () => {
    expect(featureCardClasses('pixel', BASE).badgeRow).toBe('min-h-[28px] flex items-center invisible');
    expect(featureCardClasses('pixel', { ...BASE, badge: { label: 'NEW' } }).badgeRow).toBe('min-h-[28px] flex items-center');
    const s = surfaceClasses('linear');
    expect(featureCardClasses('linear', { ...BASE, badge: { label: 'NEW' } }).badge).toBe(
      `inline-flex items-center px-2.5 py-1 text-[11px] leading-none ${s.border} ${s.radiusFull} ${s.font} ${tone.cyan.text} ${tone.cyan.border} ${tone.cyan.soft}`,
    );
    expect(classesOf(featureCardClasses('pixel', { ...BASE, badge: { label: 'HOT', tone: 'red' } }).badge)).toContain(tone.red.text);
  });

  it('clamps the title to two lines and the description to three unless told otherwise', () => {
    expect(featureCardClasses('pixel', BASE).title).toBe(
      `text-base font-semibold text-retro-text line-clamp-2 min-h-[2lh] ${surfaceClasses('pixel').fontDisplay}`,
    );
    expect(featureCardClasses('pixel', BASE).description).toBe(
      `mt-2 text-sm text-retro-muted font-mono ${featureCardDescriptionLinesClasses[3]}`,
    );
    for (const lines of [2, 3, 4] as const) {
      expect(featureCardDescriptionLinesClasses[lines]).toBe(`line-clamp-${lines} min-h-[${lines}lh]`);
      expect(classesOf(featureCardClasses('pixel', { ...BASE, descriptionLines: lines }).description)).toContain(`line-clamp-${lines}`);
    }
  });
});
