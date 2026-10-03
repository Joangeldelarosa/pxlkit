import { describe, expect, it } from 'vitest';
import { datePickerClasses, focusRing, inputBase, sizeHeight, surfaceClasses, toneMap, type Surface } from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('date picker recipes', () => {
  // Regression: the placeholder's `text-retro-muted` followed the field's
  // `text-retro-text`, which Tailwind emits later, so it was never muted.
  it('composes the trigger from the surface and size, red with an error and muted while it shows the placeholder', () => {
    const base = inputBase
      .split(' ')
      .filter((name) => name !== 'text-retro-text')
      .join(' ');
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(datePickerClasses(surface, { size: 'sm', invalid: false, placeholder: false }).trigger).toBe(
        `${base} ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.sm} ${focusRing} ${toneMap.neutral.ring} border-retro-border-strong inline-flex items-center justify-between text-left px-3 text-retro-text`,
      );
      const placeholder = datePickerClasses(surface, { size: 'lg', invalid: true, placeholder: true }).trigger;
      expect(placeholder).toContain(
        `${sizeHeight.lg} ${focusRing} ${toneMap.neutral.ring} border-retro-red/60 inline-flex items-center justify-between text-left px-3 text-retro-muted`,
      );
      expect(placeholder.split(' ')).not.toContain('text-retro-text');
    }
  });

  it("keeps room at the trigger's end for a range picker's clear button, laid over it where the mark would be", () => {
    const pixel = datePickerClasses('pixel', { size: 'md', invalid: false, placeholder: false, clearButton: true });
    const linear = datePickerClasses('linear', { size: 'md', invalid: false, placeholder: false, clearButton: true });
    expect(pixel.trigger).toContain('inline-flex items-center justify-between text-left pl-3 pr-7');
    expect(pixel.trigger).not.toContain('px-3');
    const button =
      'text-retro-muted hover:text-retro-text text-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-retro-cyan/40 rounded-[2px]';
    expect(pixel.clearButton).toBe(
      `absolute top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center right-1.5 ${button} font-mono`,
    );
    expect(linear.clearButton).toBe(
      `absolute top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center right-1 ${button} font-sans`,
    );
  });

  it('sizes the popover for one month or two side by side', () => {
    const one = datePickerClasses('linear', { size: 'md', invalid: false, placeholder: true });
    const two = datePickerClasses('linear', { size: 'md', invalid: false, placeholder: true, months: 2 });
    expect(one.content).toBe('w-[18rem] font-sans');
    expect(two.content).toBe('w-[34rem] max-w-[calc(100vw-1rem)] font-sans');
    expect(one.months).toBe('grid gap-4 grid-cols-1');
    expect(two.months).toBe('grid gap-4 grid-cols-1 sm:grid-cols-2');
  });

  it('styles the presets, the clear button and the mark after the trigger text', () => {
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
    }
  });
});
