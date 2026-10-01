import { describe, expect, it } from 'vitest';
import {
  PXLKIT_FONTS,
  TURKISH_CHARACTERS,
  buildGoogleFontsUrl,
  createLocaleContextValue,
  toLocaleLower,
  toLocaleUpper,
} from '../index';

describe('buildGoogleFontsUrl', () => {
  it('loads every kit font with the latin subset by default', () => {
    expect(buildGoogleFontsUrl()).toBe(
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&subset=latin&display=swap',
    );
  });

  it('adds latin-ext for Turkish', () => {
    expect(buildGoogleFontsUrl('tr')).toContain('&subset=latin,latin-ext&');
  });

  it('falls back to the English subsets for an unknown locale', () => {
    expect(buildGoogleFontsUrl('xx' as never)).toBe(buildGoogleFontsUrl('en'));
  });
});

describe('locale-aware case mapping', () => {
  it('maps the Turkish dotted and dotless i', () => {
    expect(toLocaleUpper('istanbul ılık', 'tr')).toBe('İSTANBUL ILIK');
    expect(toLocaleLower('İSTANBUL ILIK', 'tr')).toBe('istanbul ılık');
  });

  it('defaults to English', () => {
    expect(toLocaleUpper('istanbul')).toBe('ISTANBUL');
    expect(toLocaleLower('ISTANBUL')).toBe('istanbul');
  });

  it('round-trips the Turkish sample text', () => {
    expect(toLocaleLower(toLocaleUpper(TURKISH_CHARACTERS.sample, 'tr'), 'tr')).toBe(
      TURKISH_CHARACTERS.sample.toLocaleLowerCase('tr'),
    );
  });
});

describe('createLocaleContextValue', () => {
  it('binds the helpers to the locale', () => {
    const tr = createLocaleContextValue('tr');
    expect(tr.locale).toBe('tr');
    expect(tr.upper('i')).toBe('İ');
    expect(tr.lower('I')).toBe('ı');
    expect(tr.fontsUrl).toBe(buildGoogleFontsUrl('tr'));
  });

  it('defaults to English', () => {
    const en = createLocaleContextValue();
    expect(en.locale).toBe('en');
    expect(en.upper('i')).toBe('I');
    expect(en.fontsUrl).toBe(buildGoogleFontsUrl('en'));
  });
});

describe('PXLKIT_FONTS', () => {
  it('maps each font to its CSS variable', () => {
    expect(PXLKIT_FONTS.pixel.cssVar).toBe('--font-pixel');
    expect(PXLKIT_FONTS.sans.cssVar).toBe('--font-sans');
    expect(PXLKIT_FONTS.mono.cssVar).toBe('--font-mono');
  });
});
