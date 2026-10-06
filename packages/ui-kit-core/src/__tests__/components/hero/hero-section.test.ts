import { describe, expect, it } from 'vitest';
import {
  heroAlign,
  heroContainerPadding,
  heroDensityRhythm,
  heroEyebrowSizeClasses,
  heroHeadlineSizeClasses,
  heroLayout,
  heroMinHeightClasses,
  heroParallaxBodyClasses,
  heroParallaxMediaClasses,
  heroSectionClasses,
  heroSplitMediaClasses,
  heroSublineSizeClasses,
  rhythm,
  surfaceClasses,
  tone,
} from '../../../index';

const FONT_WEIGHT = /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/;

describe('hero section layout', () => {
  it('centres the text of centered and parallax heroes and start-aligns split ones', () => {
    expect(heroAlign('centered')).toBe('center');
    expect(heroAlign('parallax')).toBe('center');
    expect(heroAlign('split')).toBe('start');
  });

  it('puts the media beside, behind or below the text; a split hero without media stacks', () => {
    expect(heroLayout('split', true)).toBe('split');
    expect(heroLayout('split', false)).toBe('stacked');
    expect(heroLayout('parallax', true)).toBe('parallax');
    expect(heroLayout('parallax', false)).toBe('parallax');
    expect(heroLayout('centered', true)).toBe('stacked');
    expect(heroLayout('centered', false)).toBe('stacked');
  });

  it('pads the container less when compact', () => {
    expect(heroContainerPadding('compact')).toBe('md');
    expect(heroContainerPadding('comfortable')).toBe('lg');
  });
});

describe('hero section recipes', () => {
  it('spells out the heights, type sizes and rhythm of each density', () => {
    expect(heroMinHeightClasses).toEqual({
      sm: 'min-h-[400px]',
      md: 'min-h-[480px]',
      lg: 'min-h-[640px]',
      fullscreen: 'min-h-screen',
    });
    expect(heroHeadlineSizeClasses.compact).toBe('text-3xl sm:text-4xl lg:text-5xl');
    expect(heroHeadlineSizeClasses.comfortable).toBe('text-4xl sm:text-5xl lg:text-6xl');
    expect(heroSublineSizeClasses).toEqual({ compact: 'text-base sm:text-lg', comfortable: 'text-lg sm:text-xl' });
    expect(heroEyebrowSizeClasses).toBe('text-xs sm:text-sm');
    expect(heroDensityRhythm.compact).toEqual({
      eyebrowToHeadline: 'mt-3',
      headlineToSubline: 'mt-2',
      sublineToCtas: 'mt-5',
      ctasToInstall: 'mt-6',
      installToMeta: 'mt-4',
    });
    expect(heroDensityRhythm.comfortable).toEqual({
      eyebrowToHeadline: rhythm.eyebrowToHeadline,
      headlineToSubline: rhythm.headlineToSubline,
      sublineToCtas: rhythm.sublineToCtas,
      ctasToInstall: rhythm.ctasToMeta,
      installToMeta: rhythm.metaToInstall,
    });
  });

  it('centres a centred hero, its subline, install and meta', () => {
    const s = surfaceClasses('pixel');
    const classes = heroSectionClasses('pixel', {
      tone: 'cyan',
      density: 'comfortable',
      minHeight: 'md',
      align: 'center',
      hasEyebrow: true,
    });
    expect(classes).toEqual({
      root: `relative w-full flex flex-col justify-center min-h-[480px] ${s.transition}`,
      text: 'flex flex-col items-center text-center mx-auto max-w-3xl',
      eyebrow: `text-xs sm:text-sm font-pixel uppercase tracking-[0.18em] max-w-full break-words ${tone.cyan.text}`,
      headline: `text-4xl sm:text-5xl lg:text-6xl ${s.fontDisplay} font-bold leading-tight text-retro-text max-w-full break-words mt-5`,
      subline: `text-lg sm:text-xl ${s.font} text-retro-muted leading-relaxed max-w-prose break-words mt-3 mx-auto`,
      ctas: 'mt-7',
      install: 'mt-10 mx-auto',
      meta: 'mt-5 mx-auto',
      media: 'mt-10 w-full mx-auto',
    });
  });

  it('start-aligns a split hero and sets the headline apart only from an eyebrow', () => {
    const s = surfaceClasses('linear');
    const classes = heroSectionClasses('linear', {
      tone: 'neutral',
      density: 'compact',
      minHeight: 'fullscreen',
      align: 'start',
      hasEyebrow: false,
    });
    expect(classes).toEqual({
      root: `relative w-full flex flex-col justify-center min-h-screen ${s.transition}`,
      text: 'flex flex-col',
      eyebrow: `text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] max-w-full break-words ${tone.neutral.text}`,
      headline: 'text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold leading-tight text-retro-text max-w-full break-words',
      subline: `text-base sm:text-lg ${s.font} text-retro-muted leading-relaxed max-w-prose break-words mt-2`,
      ctas: 'mt-5',
      install: 'mt-6',
      meta: 'mt-4',
      media: 'mt-10 w-full',
    });
  });

  // Regression: linear's display face carries `font-semibold`, which
  // Tailwind emits after `font-bold`, so the linear headline was semibold.
  it('sets the headline bold on both surfaces, in the display face', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const { headline } = heroSectionClasses(surface, { tone: 'cyan', density: 'comfortable', minHeight: 'md', align: 'start', hasEyebrow: false });
      const classes = headline.split(' ');
      expect(classes.filter((name) => FONT_WEIGHT.test(name))).toEqual(['font-bold']);
      const face = surfaceClasses(surface).fontDisplay.split(' ').filter((name) => !FONT_WEIGHT.test(name));
      expect(classes).toEqual(expect.arrayContaining(face));
    }
  });

  // Regression: the eyebrow's `tracking-[0.18em]` followed the display
  // font's `tracking-wider` (pixel) and `tracking-tight` (linear), which
  // Tailwind emits after it, so the eyebrow never took its own letter-spacing.
  it('spaces the eyebrow by its own letter-spacing on both surfaces', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const { eyebrow } = heroSectionClasses(surface, {
        tone: 'cyan',
        density: 'comfortable',
        minHeight: 'md',
        align: 'center',
        hasEyebrow: true,
      });
      expect(eyebrow.split(' ').filter((name) => name.startsWith('tracking-'))).toEqual(['tracking-[0.18em]']);
    }
  });

  it('fills the split column and lays the parallax media behind the text', () => {
    expect(heroSplitMediaClasses).toBe('w-full');
    expect(heroParallaxBodyClasses).toBe('relative w-full');
    expect(heroParallaxMediaClasses).toBe('absolute inset-0 -z-10 overflow-hidden pointer-events-none');
  });
});
