import { describe, expect, it } from 'vitest';
import { datePickerClasses, focusRing, inputBase, sizeHeight, surfaceClasses, toneMap, type Surface } from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('date picker recipes', () => {
  it('composes the trigger from the surface and size, red with an error and muted while it shows the placeholder', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(datePickerClasses(surface, { size: 'sm', invalid: false, placeholder: false }).trigger).toBe(
        `${inputBase} ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.sm} ${focusRing} ${toneMap.neutral.ring} border-retro-border-strong inline-flex items-center justify-between px-3 text-left`,
      );
      expect(datePickerClasses(surface, { size: 'lg', invalid: true, placeholder: true }).trigger).toContain(
        `${sizeHeight.lg} ${focusRing} ${toneMap.neutral.ring} border-retro-red/60 inline-flex items-center justify-between px-3 text-left text-retro-muted`,
      );
    }
  });

  it('sizes the popover for one month or two side by side', () => {
    const one = datePickerClasses('linear', { size: 'md', invalid: false, placeholder: true });
    const two = datePickerClasses('linear', { size: 'md', invalid: false, placeholder: true, months: 2 });
    expect(one.content).toBe('w-[18rem] font-sans');
    expect(two.content).toBe('w-[34rem] max-w-[calc(100vw-1rem)] font-sans');
    expect(one.months).toBe('grid gap-4 grid-cols-1');
    expect(two.months).toBe('grid gap-4 grid-cols-1 sm:grid-cols-2');
  });

  it('styles the presets, the clear button and the marks after the trigger text', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = datePickerClasses(surface, { size: 'md', invalid: false, placeholder: false });
      expect(c.preset).toBe(
        `px-2 py-1 text-[11px] uppercase tracking-wide ${s.border} ${s.radius} border-retro-border-strong bg-retro-surface/40 text-retro-text hover:bg-retro-surface/70 ${s.transition}`,
      );
      expect(c.clear).toBe(
        `px-2 py-1 text-[11px] uppercase tracking-wide ${s.border} ${s.radius} border-retro-border-strong text-retro-muted hover:text-retro-text ${s.transition}`,
      );
      expect([c.anchor, c.value, c.mark, c.presets, c.footer]).toEqual([
        'relative block',
        'truncate',
        'ml-2 text-retro-muted text-xs',
        'mb-2 flex flex-wrap gap-1 pb-2 border-b border-retro-border/60',
        'mt-2 pt-2 border-t border-retro-border/60 flex justify-end',
      ]);
      expect(c.clearMark).toContain('cursor-pointer focus-visible:outline-none');
    }
  });
});
