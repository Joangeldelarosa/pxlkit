import { describe, expect, it } from 'vitest';
import {
  TESTIMONIAL_VERIFIED_LABEL,
  TESTIMONIAL_VERIFIED_TEXT,
  surfaceClasses,
  testimonialAttribution,
  testimonialCardClasses,
  testimonialHasStars,
  testimonialInitials,
  testimonialQuoteSizeClasses,
  tone,
  type TestimonialCardOptions,
} from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);
const BASE: TestimonialCardOptions = { variant: 'card', tone: 'neutral', quoteSize: 'normal' };

describe('testimonial card', () => {
  it('takes the initials of the first and last words, or two letters of one word', () => {
    expect(testimonialInitials('Marisol Quintero')).toBe('MQ');
    expect(testimonialInitials('  ada  king lovelace ')).toBe('AL');
    expect(testimonialInitials('plato')).toBe('PL');
    expect(testimonialInitials('   ')).toBe('?');
  });

  it('joins role and company under the name', () => {
    expect(testimonialAttribution('Head of Design', 'Northbeam')).toBe('Head of Design · Northbeam');
    expect(testimonialAttribution('PM', undefined)).toBe('PM');
    expect(testimonialAttribution(undefined, '')).toBe('');
  });

  it('shows a star rating for a positive number of stars only', () => {
    expect([testimonialHasStars(undefined), testimonialHasStars(0), testimonialHasStars(-1), testimonialHasStars(0.5)]).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it('draws the surface chrome on the card variant only', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(testimonialCardClasses(surface, BASE).root).toBe(
        `relative grid grid-rows-[auto_1fr_auto_auto] gap-3 p-5 ${s.border} ${s.radiusLg} border-retro-border bg-retro-surface/40 ${s.font}`,
      );
      for (const variant of ['quote', 'slider'] as const) {
        expect(testimonialCardClasses(surface, { ...BASE, variant }).root).toBe(
          `relative grid grid-rows-[auto_1fr_auto_auto] gap-3 p-5 ${s.font}`,
        );
      }
    }
  });

  it('reserves the quote height by size', () => {
    expect(testimonialQuoteSizeClasses).toEqual({ compact: 'min-h-[5em]', normal: 'min-h-[7em]', long: 'min-h-[9em]' });
    expect(testimonialCardClasses('pixel', { ...BASE, quoteSize: 'long' }).quoteRow).toBe('flex items-start min-h-[9em]');
    expect(testimonialCardClasses('linear', BASE).quote).toBe('text-sm leading-relaxed text-retro-text font-sans');
  });

  it('tints the initials with the avatar tone over the card tone, and badges the verified in green', () => {
    expect(classesOf(testimonialCardClasses('pixel', { ...BASE, tone: 'gold' }).avatar)).toEqual(
      expect.arrayContaining([tone.gold.border, tone.gold.bg, tone.gold.text, 'h-10', 'w-10']),
    );
    expect(classesOf(testimonialCardClasses('pixel', { ...BASE, tone: 'gold', avatarTone: 'cyan' }).avatar)).toEqual(
      expect.arrayContaining([tone.cyan.border, tone.cyan.bg, tone.cyan.text]),
    );
    const s = surfaceClasses('pixel');
    expect(testimonialCardClasses('pixel', BASE).verified).toBe(
      `inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold ${s.border} ${s.radius} ${s.fontDisplay} ${tone.green.border} ${tone.green.bg} ${tone.green.text}`,
    );
    expect([TESTIMONIAL_VERIFIED_LABEL, TESTIMONIAL_VERIFIED_TEXT]).toEqual(['Verified', 'VERIFIED']);
  });

  it('lays out the rows, the attribution and the hidden tone hint', () => {
    const classes = testimonialCardClasses('linear', { ...BASE, tone: 'purple' });
    expect(classes.header).toBe('flex items-center justify-between gap-2 min-h-[1.25rem]');
    expect(classes.stars).toBe('flex items-center');
    expect(classes.verifiedIcon).toBe('h-2.5 w-2.5');
    expect(classes.actionsRow).toBe('min-h-0');
    expect(classes.actions).toBe('pt-1');
    expect(classes.attribution).toBe('flex items-center gap-3 pt-1');
    expect(classes.avatarImage).toBe('h-full w-full object-cover');
    expect(classes.person).toBe('flex min-w-0 flex-col');
    expect(classes.name).toBe('truncate text-sm font-semibold text-retro-text font-sans');
    expect(classes.role).toBe('truncate text-xs text-retro-muted font-sans');
    expect(classes.toneHint).toBe(`hidden ${tone.purple.text}`);
  });
});
