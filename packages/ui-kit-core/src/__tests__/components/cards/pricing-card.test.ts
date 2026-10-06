import { describe, expect, it } from 'vitest';
import {
  PRICING_PREVIOUS_PRICE_LABEL,
  pricingCardClasses,
  pricingFeature,
  pricingPopularLabel,
  surfaceClasses,
  tone,
  type PricingCardOptions,
} from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);
const BASE: PricingCardOptions = { tone: 'cyan', highlight: false, bordered: true, descriptionLines: 2 };

describe('pricing card recipes', () => {
  it('frames a tier with neutral chrome, or tints and lights it up when highlighted', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(pricingCardClasses(surface, BASE).root).toBe(
        `relative flex flex-col p-5 ${s.border} ${s.radiusLg} border-retro-border bg-retro-surface/40`,
      );
      expect(pricingCardClasses(surface, { ...BASE, highlight: true }).root).toBe(
        `relative flex flex-col p-5 ${s.border} ${s.radiusLg} ${tone.cyan.border} ${tone.cyan.soft} ${tone.cyan.glow}`,
      );
    }
    expect(pricingCardClasses('pixel', { ...BASE, bordered: false, highlight: true }).root).toBe(
      `relative flex flex-col p-5 ${tone.cyan.glow}`,
    );
  });

  it('straddles the top edge with the popular ribbon, gold unless told otherwise', () => {
    const gold = classesOf(pricingCardClasses('pixel', BASE).popular);
    expect(gold).toEqual(expect.arrayContaining(['absolute', '-translate-y-1/2', tone.gold.border, tone.gold.bg, tone.gold.text]));
    expect(classesOf(pricingCardClasses('pixel', { ...BASE, popularTone: 'red' }).popular)).toContain(tone.red.bg);
    expect(pricingCardClasses('pixel', BASE).ribbonRow).toBe('relative h-7');
    expect(pricingPopularLabel({})).toBe('POPULAR');
    expect(pricingPopularLabel({ label: 'BEST VALUE', tone: 'red' })).toBe('BEST VALUE');
  });

  it('clamps the description to two or three lines, or lets it flow', () => {
    expect(pricingCardClasses('pixel', BASE).description).toBe('mt-1 text-sm text-retro-muted line-clamp-2 min-h-[2.5em] font-mono');
    expect(pricingCardClasses('pixel', { ...BASE, descriptionLines: 3 }).description).toBe(
      'mt-1 text-sm text-retro-muted line-clamp-3 min-h-[3.75em] font-mono',
    );
    expect(pricingCardClasses('linear', { ...BASE, descriptionLines: 'none' }).description).toBe('mt-1 text-sm text-retro-muted font-sans');
  });

  it('prices in the tone, the old price struck through and announced', () => {
    const classes = pricingCardClasses('pixel', { ...BASE, tone: 'gold' });
    expect(classes.amount).toBe(`text-3xl sm:text-4xl font-bold ${tone.gold.text} ${surfaceClasses('pixel').fontDisplay}`);
    expect(classes.previousPrice).toBe('line-through text-sm text-retro-muted font-mono');
    expect(classes.period).toBe('text-sm text-retro-muted font-mono');
    expect(classes.priceRow).toBe('mt-4 flex flex-wrap items-baseline gap-2');
    expect(classes.priceBadge).toBe('self-center');
    expect(PRICING_PREVIOUS_PRICE_LABEL).toBe('Previous price ');
  });

  // Regression: linear's display face carries `font-semibold`, which
  // Tailwind emits after `font-bold`, so the linear amount was semibold.
  it('sets the amount bold on both surfaces, in the display face', () => {
    const weight = /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/;
    for (const surface of ['pixel', 'linear'] as const) {
      const classes = pricingCardClasses(surface, BASE).amount.split(' ');
      expect(classes.filter((name) => weight.test(name))).toEqual(['font-bold']);
      const face = surfaceClasses(surface).fontDisplay.split(' ').filter((name) => !weight.test(name));
      expect(classes).toEqual(expect.arrayContaining(face));
    }
    expect(pricingCardClasses('linear', { ...BASE, tone: 'gold' }).amount).toBe(`text-3xl sm:text-4xl font-bold ${tone.gold.text} tracking-tight`);
  });

  it('lays out the head, the list, the spacer, the call to action and the footer', () => {
    const classes = pricingCardClasses('linear', { ...BASE, tone: 'purple' });
    expect(classes.head).toBe('flex flex-col');
    expect(classes.icon).toBe(`mb-2 inline-flex h-6 w-6 items-center justify-center ${tone.purple.text}`);
    expect(classes.name).toBe('text-base font-semibold text-retro-text font-sans');
    expect(classes.features).toBe('mt-4 space-y-2 font-sans');
    expect(classes.feature).toBe('flex items-start gap-2 text-sm');
    expect(classes.spacer).toBe('flex-1');
    expect(classes.cta).toBe('mt-5');
    expect(classes.footer).toBe('mt-3 text-xs text-retro-muted font-sans');
  });

  it('checks included features, crosses out excluded ones, and names both for screen readers', () => {
    expect(pricingFeature({ label: 'A' }, 'cyan')).toEqual({
      included: true,
      glyph: 'check',
      markClasses: `mt-0.5 shrink-0 ${tone.cyan.text}`,
      labelClasses: 'text-retro-text',
      srLabel: 'Included: ',
    });
    expect(pricingFeature({ label: 'A', highlight: true }, 'cyan').labelClasses).toBe(`${tone.cyan.text} font-medium`);
    expect(pricingFeature({ label: 'B', included: false, highlight: true }, 'cyan')).toEqual({
      included: false,
      glyph: 'close',
      markClasses: 'mt-0.5 shrink-0 text-retro-muted',
      labelClasses: 'text-retro-muted line-through',
      srLabel: 'Not included: ',
    });
  });
});
