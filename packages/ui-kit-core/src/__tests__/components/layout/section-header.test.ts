import { describe, expect, it } from 'vitest';
import {
  rhythm,
  sectionHeaderClasses,
  sectionHeaderSpacingClasses,
  surfaceClasses,
  tone,
  type SectionHeaderOptions,
} from '../../../index';

const options: SectionHeaderOptions = { align: 'start', size: 'md', spacing: 'normal', eyebrow: true };

describe('section header recipes', () => {
  it('stacks the blocks on the page rhythm, at the start', () => {
    const s = surfaceClasses('pixel');
    const c = sectionHeaderClasses('pixel', options);
    expect(c.header).toBe('w-full');
    expect(c.stack).toBe('flex flex-col');
    expect(c.eyebrow).toBe(`text-xs ${s.fontDisplay} uppercase tracking-[0.18em] text-retro-muted`);
    expect(c.title).toBe(`text-2xl sm:text-3xl ${s.fontDisplay} font-bold leading-tight text-retro-text ${rhythm.eyebrowToHeadline}`);
    expect(c.description).toBe(
      `text-base ${s.font} text-retro-muted leading-relaxed max-w-prose ${rhythm.headlineToSubline}`,
    );
    expect(c.actions).toBe(`flex flex-wrap gap-3 ${rhythm.sublineToCtas}`);
  });

  it('centres every block when centred', () => {
    const c = sectionHeaderClasses('linear', { ...options, align: 'center', size: 'lg', spacing: 'loose' });
    expect(c.stack).toBe('flex flex-col mx-auto text-center items-center max-w-3xl');
    expect(c.description.endsWith('mt-5 mx-auto')).toBe(true);
    expect(c.actions).toBe('flex flex-wrap gap-3 mt-10 justify-center');
    expect(c.title.startsWith('text-3xl sm:text-4xl lg:text-5xl')).toBe(true);
  });

  it('tints the title and eyebrow with the title tone', () => {
    const c = sectionHeaderClasses('pixel', { ...options, titleTone: 'cyan', size: 'sm' });
    expect(c.eyebrow.startsWith('text-[10px]')).toBe(true);
    expect(c.eyebrow.endsWith(tone.cyan.text)).toBe(true);
    expect(c.title).toContain(` ${tone.cyan.text} `);
  });

  it('keeps the title close to the top without an eyebrow', () => {
    for (const spacing of ['tight', 'normal', 'loose'] as const) {
      const { eyebrowToTitle } = sectionHeaderSpacingClasses[spacing];
      expect(sectionHeaderClasses('pixel', { ...options, spacing }).title.endsWith(eyebrowToTitle)).toBe(true);
      expect(sectionHeaderClasses('pixel', { ...options, spacing, eyebrow: false }).title).not.toContain(eyebrowToTitle);
    }
    expect(sectionHeaderSpacingClasses.tight).toEqual({ eyebrowToTitle: 'mt-2', titleToDescription: 'mt-2', descriptionToActions: 'mt-4' });
  });
});
