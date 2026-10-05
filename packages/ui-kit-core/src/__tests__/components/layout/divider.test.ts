import { describe, expect, it } from 'vitest';
import { dividerClasses, dividerSpacingClasses, toneMap } from '../../../index';

describe('divider recipes', () => {
  it('draws a dotted rule on the pixel surface and a thin solid one on the linear surface', () => {
    expect(dividerClasses('pixel', 'none', 'neutral').rule).toBe('border-t-2 border-dotted border-retro-border/40');
    expect(dividerClasses('linear', 'none', 'neutral').rule).toBe('border-t border-retro-border/40');
    expect(dividerClasses('pixel', 'none', 'neutral').line).toBe('border-t-2 border-dotted flex-1 border-retro-border/40');
    expect(dividerClasses('linear', 'none', 'neutral').line).toBe('border-t flex-1 border-retro-border/40');
  });

  it('pads the rule or the labelled separator symmetrically', () => {
    expect(dividerSpacingClasses).toEqual({ none: '', sm: 'py-3', md: 'py-6', lg: 'py-10' });
    expect(dividerClasses('pixel', 'md', 'neutral').rule).toBe('border-t-2 border-dotted border-retro-border/40 py-6');
    expect(dividerClasses('pixel', 'lg', 'neutral').separator).toBe('flex items-center gap-3 py-10');
    expect(dividerClasses('pixel', 'none', 'neutral').separator).toBe('flex items-center gap-3');
  });

  it('sets the label in the surface display face, at its own letter-spacing, and the tone colour', () => {
    const base = 'text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5';
    expect(dividerClasses('pixel', 'none', 'cyan').label).toBe(`${base} font-pixel ${toneMap.cyan.text}`);
    // Linear's display weight, without the tight letter-spacing of its face.
    expect(dividerClasses('linear', 'none', 'gold').label).toBe(`${base} font-semibold ${toneMap.gold.text}`);
  });
});
