import { describe, expect, it } from 'vitest';
import { statCardClasses, surfaceClasses, toneMap, type StatCardOptions } from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);
const BASE: StatCardOptions = {
  tone: 'gold',
  size: 'md',
  iconPosition: 'top',
  valueTone: false,
  align: 'start',
  bordered: true,
};

describe('stat card recipes', () => {
  it('frames the metric in the tone, and drops the chrome when not bordered', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const t = toneMap.cyan;
      expect(statCardClasses(surface, { ...BASE, tone: 'cyan' }).root).toBe(`p-4 ${s.border} ${s.radiusLg} ${t.border} ${t.soft}`);
    }
    expect(statCardClasses('pixel', { ...BASE, bordered: false, align: 'center' }).root).toBe('p-4 text-center');
  });

  it('lays the icon out above, beside or in the bottom-left corner', () => {
    expect(classesOf(statCardClasses('pixel', { ...BASE, iconPosition: 'right' }).root)).toEqual(
      expect.arrayContaining(['grid', 'grid-cols-[1fr_auto]', 'items-center', 'gap-3']),
    );
    expect(classesOf(statCardClasses('pixel', { ...BASE, iconPosition: 'left' }).root)).toEqual(
      expect.arrayContaining(['flex', 'items-center', 'gap-3']),
    );
    expect(classesOf(statCardClasses('pixel', { ...BASE, iconPosition: 'bottom-left' }).root)).toEqual(
      expect.arrayContaining(['relative', 'overflow-hidden']),
    );
    expect(statCardClasses('pixel', { ...BASE, iconPosition: 'left' }).content).toBe('min-w-0 flex-1');
    expect(statCardClasses('pixel', { ...BASE, iconPosition: 'right' }).content).toBe('min-w-0');
    expect(statCardClasses('pixel', { ...BASE, size: 'lg', tone: 'red' }).cornerIcon).toBe(
      `absolute bottom-0 left-0 inline-flex max-w-full items-center justify-center p-6 text-lg ${toneMap.red.text}`,
    );
  });

  it('spreads the label and icon apart, or centres them', () => {
    expect(statCardClasses('pixel', BASE).header).toBe('mb-3 flex items-center justify-between');
    expect(statCardClasses('pixel', { ...BASE, align: 'center' }).header).toBe('mb-3 flex items-center justify-center gap-2');
    expect(statCardClasses('pixel', { ...BASE, align: 'center', iconPosition: 'bottom-left' }).header).toBe(
      'mb-3 flex items-center justify-between',
    );
  });

  it('scales padding and type with the size, the value in pixel type on the pixel surface', () => {
    const scales = {
      sm: { padding: 'p-3', caption: 'text-[10px]', icon: 'text-xs', gap: 'mt-1.5', pixel: 'text-xs font-pixel', linear: 'text-sm font-semibold' },
      md: { padding: 'p-4', caption: 'text-xs', icon: 'text-sm', gap: 'mt-2', pixel: 'text-sm font-pixel', linear: 'text-base font-semibold' },
      lg: { padding: 'p-6', caption: 'text-sm', icon: 'text-lg', gap: 'mt-3', pixel: 'text-lg font-pixel', linear: 'text-2xl font-semibold' },
    } as const;
    for (const [size, scale] of Object.entries(scales) as [keyof typeof scales, (typeof scales)[keyof typeof scales]][]) {
      const pixel = statCardClasses('pixel', { ...BASE, size, bordered: false });
      expect(pixel.root).toBe(scale.padding);
      expect(pixel.label).toBe(`${scale.caption} text-retro-muted font-mono`);
      expect(pixel.trend).toBe(`${scale.gap} ${scale.caption} text-retro-muted font-mono`);
      expect(pixel.valueRow).toBe(scale.gap);
      expect(pixel.icon).toBe(`inline-flex items-center justify-center shrink-0 ${scale.icon} ${toneMap.gold.text}`);
      expect(pixel.value).toBe(`text-retro-text ${scale.pixel}`);
      expect(statCardClasses('linear', { ...BASE, size }).value).toBe(`text-retro-text ${scale.linear}`);
    }
  });

  it('colours the value with the tone when asked', () => {
    expect(statCardClasses('pixel', { ...BASE, tone: 'green', valueTone: true }).value).toBe(`${toneMap.green.text} text-sm font-pixel`);
  });
});
