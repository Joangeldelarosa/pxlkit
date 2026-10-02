import { describe, expect, it } from 'vitest';
import { alertDialogClasses, alertDialogLayerClasses, modalLayerClasses, surfaceClasses, toneMap, type Surface } from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const idle = { destructive: false, reducedMotion: false };
const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('alert dialog recipes', () => {
  it('centres the panel like the modal does', () => {
    expect(alertDialogLayerClasses).toBe(modalLayerClasses);
  });

  it('draws a window on the pixel surface and a card on the linear one', () => {
    const pixel = alertDialogClasses('pixel', idle);
    expect(classesOf(pixel.panel)).toContain('p-0');
    expect(pixel.header).toContain('border-b-2 border-retro-border bg-retro-surface/60');
    expect(pixel.title).toBe('font-pixel text-[11px] text-retro-green');
    expect(pixel.body).toBe('p-5');
    expect(pixel.description).toBe(`text-sm text-retro-muted ${surfaceClasses('pixel').font}`);

    const linear = alertDialogClasses('linear', idle);
    expect(classesOf(linear.panel)).toContain('p-5');
    expect(linear.header).toBe('flex items-start gap-3');
    expect(linear.texts).toBe('flex-1');
    expect(linear.title).toContain(surfaceClasses('linear').fontDisplay);
    expect(linear.description).toBe(`mt-2 text-sm text-retro-muted ${surfaceClasses('linear').font}`);

    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const panel = classesOf(alertDialogClasses(surface, idle).panel);
      for (const part of [s.border, s.radiusLg, 'max-w-sm', 'border-retro-border']) expect(panel).toEqual(expect.arrayContaining(classesOf(part)));
      expect(alertDialogClasses(surface, idle).actions).toBe('mt-5 flex items-center justify-end gap-2');
    }
  });

  it('accents the dialog in red when destructive and in cyan otherwise', () => {
    for (const surface of SURFACES) {
      const safe = alertDialogClasses(surface, idle);
      const destructive = alertDialogClasses(surface, { destructive: true, reducedMotion: false });
      expect(safe.accent).toContain(toneMap.cyan.fill);
      expect(destructive.accent).toContain(toneMap.red.fill);
      for (const part of ['border', 'bg', 'text', 'hover', 'ring'] as const) {
        expect(safe.action).toContain(toneMap.cyan[part]);
        expect(destructive.action).toContain(toneMap.red[part]);
      }
      // Cancel stays neutral either way.
      expect(destructive.cancel).toBe(safe.cancel);
      expect(safe.cancel).toContain('border-retro-border text-retro-muted');
    }
    expect(alertDialogClasses('pixel', idle).accent).not.toContain('rounded-full');
    expect(alertDialogClasses('linear', idle).accent).toContain('rounded-full');
  });

  it('sizes the button text with the surface', () => {
    expect(classesOf(alertDialogClasses('pixel', idle).cancel)).toContain('text-xs');
    expect(classesOf(alertDialogClasses('pixel', idle).action)).toContain('text-xs');
    expect(classesOf(alertDialogClasses('linear', idle).cancel)).toContain('text-sm');
    expect(classesOf(alertDialogClasses('linear', idle).action)).toContain('text-sm');
    expect(alertDialogClasses('pixel', idle).action.startsWith('inline-flex items-center justify-center gap-2 px-4 h-9')).toBe(true);
  });

  it('spins the pending indicator unless motion is reduced, on every surface', () => {
    for (const surface of SURFACES) {
      expect(classesOf(alertDialogClasses(surface, idle).spinner)).toContain('animate-spin');
      expect(classesOf(alertDialogClasses(surface, { destructive: false, reducedMotion: true }).spinner)).not.toContain(
        'animate-spin',
      );
    }
  });
});
