import { describe, expect, it } from 'vitest';
import {
  cardBodyClasses,
  cardClasses,
  cardDescriptionLinesClasses,
  cardFooterClasses,
  cardHeaderClasses,
  cardPaddingClasses,
  isCardActivationKey,
  surfaceClasses,
  tone,
  type CardOptions,
} from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);
const PLAIN: CardOptions = {
  bordered: true,
  interactive: false,
  link: false,
  media: false,
  badge: false,
  description: false,
};
const FOCUS_RING = [
  'focus-visible:outline-hidden',
  'focus-visible:ring-2',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-retro-bg',
  'focus-visible:ring-retro-cyan/60',
];

describe('card recipes', () => {
  it('frames a plain card with the surface chrome and the legacy padding', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(cardClasses(surface, PLAIN).root).toBe(
        `relative flex flex-col transition-all bg-retro-surface/60 ${s.border} ${s.radiusLg} border-retro-border/40 hover:border-retro-border/60 p-4`,
      );
      expect(cardClasses(surface, PLAIN).title).toBe(`text-sm font-semibold text-retro-text ${s.font}`);
    }
  });

  // Regression: a toned card also took the neutral `bg-retro-surface/60`,
  // which Tailwind emits after the tone's tint, so the tint never showed.
  it('tints border and background with the tone, and drops the chrome when not bordered', () => {
    const tinted = classesOf(cardClasses('pixel', { ...PLAIN, tone: 'cyan' }).root);
    expect(tinted).toEqual(expect.arrayContaining([tone.cyan.border, tone.cyan.soft]));
    expect(tinted).not.toContain('border-retro-border/40');
    expect(tinted).not.toContain('bg-retro-surface/60');
    expect(cardClasses('linear', { ...PLAIN, tone: 'cyan', bordered: false }).root).toBe(
      'relative flex flex-col transition-all p-4',
    );
  });

  it('lifts on hover when interactive, and rings focus on interactive cards and links', () => {
    const interactive = classesOf(cardClasses('pixel', { ...PLAIN, interactive: true }).root);
    expect(interactive).toEqual(
      expect.arrayContaining(['cursor-pointer', 'hover:-translate-y-[2px]', 'hover:shadow-lg', ...FOCUS_RING]),
    );
    const link = classesOf(cardClasses('pixel', { ...PLAIN, link: true }).root);
    expect(link).toEqual(expect.arrayContaining([...FOCUS_RING, 'no-underline', 'text-inherit']));
    expect(link).not.toContain('cursor-pointer');
    expect(classesOf(cardClasses('pixel', PLAIN).root)).not.toContain('focus-visible:ring-2');
  });

  it('moves the padding from the root to the content under a media strip, and clips media and ribbon', () => {
    const plain = cardClasses('pixel', { ...PLAIN, padding: 'lg' });
    expect(classesOf(plain.root)).toContain('p-6');
    expect(plain.content).toBe('flex flex-1 flex-col');
    const media = cardClasses('pixel', { ...PLAIN, padding: 'lg', media: true });
    expect(classesOf(media.root)).toEqual(expect.arrayContaining(['overflow-hidden']));
    expect(classesOf(media.root)).not.toContain('p-6');
    expect(media.content).toBe('p-6 flex flex-1 flex-col');
    expect(cardClasses('pixel', { ...PLAIN, media: true }).content).toBe('p-4 flex flex-1 flex-col');
    expect(classesOf(cardClasses('pixel', { ...PLAIN, badge: true }).root)).toContain('overflow-hidden');
    expect(media.media).toBe('-m-0 overflow-hidden');
  });

  it('scales the padding', () => {
    expect(cardPaddingClasses).toEqual({ none: 'p-0', sm: 'p-2', md: 'p-3', lg: 'p-6' });
  });

  it('tightens the header over a description, and clamps the description', () => {
    expect(cardClasses('pixel', PLAIN).header).toBe('flex items-center gap-2 border-b border-retro-border/30 pb-3 mb-3');
    expect(cardClasses('pixel', { ...PLAIN, description: true }).header).toBe(
      'flex items-center gap-2 border-b border-retro-border/30 pb-3 mb-2',
    );
    expect(cardClasses('pixel', PLAIN).description).toBe('mb-3 text-sm text-retro-muted');
    for (const lines of [2, 3, 4] as const) {
      expect(cardDescriptionLinesClasses[lines]).toBe(`line-clamp-${lines} min-h-[${lines}em]`);
      expect(cardClasses('pixel', { ...PLAIN, descriptionLines: lines }).description).toBe(
        `mb-3 text-sm text-retro-muted ${cardDescriptionLinesClasses[lines]}`,
      );
    }
  });

  it('styles the icon, body and footer, and the Header / Body / Footer parts', () => {
    const classes = cardClasses('pixel', PLAIN);
    expect(classes.icon).toBe('inline-flex items-center justify-center shrink-0');
    expect(classes.body).toBe('text-sm text-retro-muted');
    expect(classes.footer).toBe('mt-4 border-t border-retro-border/30 pt-3');
    expect(cardHeaderClasses).toBe('mb-3 flex items-center gap-2 border-b border-retro-border/30 pb-3');
    expect(cardBodyClasses).toBe('flex-1 text-sm text-retro-muted');
    expect(cardFooterClasses).toBe('mt-auto border-t border-retro-border/30 pt-3');
  });

  it('activates an interactive card with Enter and Space only', () => {
    expect(isCardActivationKey('Enter')).toBe(true);
    expect(isCardActivationKey(' ')).toBe(true);
    expect(isCardActivationKey('Spacebar')).toBe(false);
    expect(isCardActivationKey('a')).toBe(false);
  });
});
