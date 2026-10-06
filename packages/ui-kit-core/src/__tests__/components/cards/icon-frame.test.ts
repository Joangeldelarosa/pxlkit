import { describe, expect, it } from 'vitest';
import {
  iconFrameAccentPositionClasses,
  iconFrameClasses,
  iconFrameSizeClasses,
  surfaceClasses,
  tone,
  type IconFrameOptions,
} from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);
const BASE: IconFrameOptions = { size: 56, tone: 'neutral', shape: 'square', animated: false, reducedMotion: false };

describe('icon frame recipes', () => {
  it('frames the icon at its size in the tone, with the surface border', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const t = tone.cyan;
      expect(iconFrameClasses(surface, { ...BASE, tone: 'cyan', size: 112 }).root).toBe(
        `relative inline-flex items-center justify-center w-28 h-28 ${s.border} ${t.border} ${t.soft} ${t.text} ${s.radius}`,
      );
    }
    expect(iconFrameSizeClasses).toEqual({ 48: 'w-12 h-12', 56: 'w-14 h-14', 64: 'w-16 h-16', 80: 'w-20 h-20', 112: 'w-28 h-28' });
    expect(iconFrameClasses('pixel', BASE).icon).toBe('inline-flex items-center justify-center');
  });

  it('rounds the frame and the accent with the shape; square keeps the surface corners', () => {
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, shape: 'circle' }).root)).toContain('rounded-full');
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, shape: 'circle' }).accent)).toContain('rounded-full');
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, shape: 'rounded' }).root)).toContain('rounded-md');
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, shape: 'rounded' }).accent)).toContain('pxl-corner-sm');
    expect(classesOf(iconFrameClasses('linear', BASE).root)).toContain('rounded-md');
    expect(classesOf(iconFrameClasses('pixel', BASE).root)).toContain('pxl-corner-sm');
  });

  it('pins the accent to its corner, top right unless told otherwise', () => {
    const t = tone.gold;
    expect(iconFrameClasses('pixel', { ...BASE, tone: 'gold' }).accent).toBe(
      `inline-flex items-center justify-center w-4 h-4 ${iconFrameAccentPositionClasses['top-right']} border-2 ${t.border} ${t.bg} pxl-corner-sm`,
    );
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, accentPosition: 'bottom-right' }).accent)).toEqual(
      expect.arrayContaining(['bottom-0', 'right-0', '-mb-1.5', '-mr-1.5']),
    );
  });

  it('pulses when animated, unless the user prefers reduced motion', () => {
    // A motion-safe variant: still for that reader before the page hydrates
    // too, when the server markup still holds it.
    const pulse = 'motion-safe:animate-pulse';
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, animated: true }).root)).toContain(pulse);
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, animated: true }).root)).not.toContain('animate-pulse');
    expect(classesOf(iconFrameClasses('pixel', { ...BASE, animated: true, reducedMotion: true }).root)).not.toContain(pulse);
    expect(classesOf(iconFrameClasses('pixel', BASE).root)).not.toContain(pulse);
  });
});
