import { describe, expect, it } from 'vitest';
import { focusRing, surfaceClasses, toneMap } from '../../../common';
import { collapsibleClasses, collapsibleIds } from '../../../components/data/collapsible';

const classesOf = (value: string) => value.split(' ');

describe('collapsible recipes', () => {
  it('frames the collapsible only when bordered', () => {
    expect(collapsibleClasses('pixel', { bordered: false, open: false, tone: 'neutral' }).root).toBe('');
    expect(classesOf(collapsibleClasses('pixel', { bordered: true, open: false, tone: 'neutral' }).root)).toEqual(
      expect.arrayContaining(['border-2', 'pxl-corner-sm', 'border-retro-border']),
    );
    expect(classesOf(collapsibleClasses('linear', { bordered: true, open: false, tone: 'neutral' }).root)).toEqual(
      expect.arrayContaining(['border', 'rounded-md']),
    );
  });

  it('turns the chevron while open', () => {
    expect(classesOf(collapsibleClasses('pixel', { bordered: false, open: true, tone: 'neutral' }).chevron)).toContain('rotate-180');
    expect(classesOf(collapsibleClasses('pixel', { bordered: false, open: false, tone: 'neutral' }).chevron)).not.toContain('rotate-180');
  });

  // Regression: the header was a small PixelButton with `px-1.5` added, and
  // Tailwind emits the button's own `px-3` after it, so it kept its padding.
  it('makes the header a compact ghost button of the tone, and spaces the body from it', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const t = toneMap.cyan;
      const parts = collapsibleClasses(surface, { bordered: false, open: true, tone: 'cyan' });
      expect(parts.trigger).toBe(
        `inline-flex items-center justify-center gap-1.5 px-1.5 py-0.5 text-xs font-medium focus-visible:outline-hidden ${s.font} ${s.radius} ${s.transition} ${focusRing} ${t.ring} ${t.text} border border-transparent bg-transparent ${t.hover} active:scale-[0.97]`,
      );
      for (const size of ['h-8', 'px-3']) expect(classesOf(parts.trigger)).not.toContain(size);
      expect(parts.content).toBe('mt-2');
    }
  });

  it('derives the header and body ids from one base id', () => {
    expect(collapsibleIds('pxl-1')).toEqual({ trigger: 'pxl-1-trigger', content: 'pxl-1-content' });
  });
});
