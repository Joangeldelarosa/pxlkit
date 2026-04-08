import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  toLocaleUpper,
  toLocaleLower,
  buildGoogleFontsUrl,
  PXLKIT_FONTS,
  TURKISH_CHARACTERS,
  PxlKitLocaleProvider,
  usePxlKitLocale,
} from '../locale';

/* ═══════════════════════════════════════════════════════════════════════════════
   toLocaleUpper — Turkish vs English uppercasing
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('toLocaleUpper', () => {
  describe('Turkish locale (tr)', () => {
    it('converts dotted lowercase i to dotted uppercase İ', () => {
      expect(toLocaleUpper('i', 'tr')).toBe('İ');
    });

    it('converts dotless lowercase ı to dotless uppercase I', () => {
      expect(toLocaleUpper('ı', 'tr')).toBe('I');
    });

    it('converts "istanbul" to "İSTANBUL" (with dotted İ)', () => {
      expect(toLocaleUpper('istanbul', 'tr')).toBe('İSTANBUL');
    });

    it('correctly uppercases the Turkish pangram', () => {
      const result = toLocaleUpper(TURKISH_CHARACTERS.pangram, 'tr');
      // "Pijamalı hasta yağız şoföre çabucak güvendi"
      // → "PİJAMALI HASTA YAĞIZ ŞOFÖRE ÇABUCAK GÜVENDİ"
      expect(result).toContain('İ'); // dotted İ from 'i'
      expect(result).toContain('Ş'); // Ş from 'ş'
      expect(result).toContain('Ğ'); // Ğ from 'ğ'
      expect(result).toContain('Ç'); // Ç from 'ç'
      expect(result).toContain('Ö'); // Ö from 'ö'
      expect(result).toContain('Ü'); // Ü from 'ü'
    });

    it('correctly uppercases Turkish special characters', () => {
      expect(toLocaleUpper('ç', 'tr')).toBe('Ç');
      expect(toLocaleUpper('ğ', 'tr')).toBe('Ğ');
      expect(toLocaleUpper('ö', 'tr')).toBe('Ö');
      expect(toLocaleUpper('ş', 'tr')).toBe('Ş');
      expect(toLocaleUpper('ü', 'tr')).toBe('Ü');
    });

    it('correctly uppercases the İstanbul sample text', () => {
      const result = toLocaleUpper(TURKISH_CHARACTERS.sample, 'tr');
      // "İstanbul güneşli bir şehirdir"
      expect(result).toBe('İSTANBUL GÜNEŞLİ BİR ŞEHİRDİR');
    });

    it('handles empty strings', () => {
      expect(toLocaleUpper('', 'tr')).toBe('');
    });

    it('handles strings with no Turkish characters', () => {
      expect(toLocaleUpper('hello world', 'tr')).toBe('HELLO WORLD');
    });

    it('handles mixed Turkish and ASCII characters', () => {
      expect(toLocaleUpper('test işlem', 'tr')).toBe('TEST İŞLEM');
    });
  });

  describe('English locale (en)', () => {
    it('converts i to I (without dot)', () => {
      expect(toLocaleUpper('i', 'en')).toBe('I');
    });

    it('converts "istanbul" to "ISTANBUL" (without dot on I)', () => {
      expect(toLocaleUpper('istanbul', 'en')).toBe('ISTANBUL');
    });

    it('handles standard English text', () => {
      expect(toLocaleUpper('hello world', 'en')).toBe('HELLO WORLD');
    });

    it('handles empty strings', () => {
      expect(toLocaleUpper('', 'en')).toBe('');
    });
  });

  describe('default locale', () => {
    it('defaults to English when no locale is specified', () => {
      expect(toLocaleUpper('istanbul')).toBe('ISTANBUL');
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   toLocaleLower — Turkish vs English lowercasing
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('toLocaleLower', () => {
  describe('Turkish locale (tr)', () => {
    it('converts dotted uppercase İ to dotted lowercase i', () => {
      expect(toLocaleLower('İ', 'tr')).toBe('i');
    });

    it('converts dotless uppercase I to dotless lowercase ı', () => {
      expect(toLocaleLower('I', 'tr')).toBe('ı');
    });

    it('converts "İSTANBUL" to "istanbul"', () => {
      expect(toLocaleLower('İSTANBUL', 'tr')).toBe('istanbul');
    });

    it('converts "ISTANBUL" (dotless I) to "ıstanbul"', () => {
      expect(toLocaleLower('ISTANBUL', 'tr')).toBe('ıstanbul');
    });

    it('correctly lowercases Turkish special uppercase characters', () => {
      expect(toLocaleLower('Ç', 'tr')).toBe('ç');
      expect(toLocaleLower('Ğ', 'tr')).toBe('ğ');
      expect(toLocaleLower('Ö', 'tr')).toBe('ö');
      expect(toLocaleLower('Ş', 'tr')).toBe('ş');
      expect(toLocaleLower('Ü', 'tr')).toBe('ü');
    });

    it('handles empty strings', () => {
      expect(toLocaleLower('', 'tr')).toBe('');
    });
  });

  describe('English locale (en)', () => {
    it('converts I to i', () => {
      expect(toLocaleLower('I', 'en')).toBe('i');
    });

    it('handles standard English text', () => {
      expect(toLocaleLower('HELLO WORLD', 'en')).toBe('hello world');
    });
  });

  describe('default locale', () => {
    it('defaults to English when no locale is specified', () => {
      expect(toLocaleLower('ISTANBUL')).toBe('istanbul');
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   Roundtrip: upper → lower → upper consistency
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('roundtrip consistency', () => {
  it('Turkish: lowercase → upper → lower returns original', () => {
    const original = 'pijamalı hasta yağız şoföre çabucak güvendi';
    const upper = toLocaleUpper(original, 'tr');
    const lower = toLocaleLower(upper, 'tr');
    expect(lower).toBe(original);
  });

  it('English: lowercase → upper → lower returns original', () => {
    const original = 'hello world';
    const upper = toLocaleUpper(original, 'en');
    const lower = toLocaleLower(upper, 'en');
    expect(lower).toBe(original);
  });

  it('Turkish dotted i roundtrip preserves the dot', () => {
    // i → İ → i (all in Turkish locale)
    const step1 = toLocaleUpper('i', 'tr'); // → İ
    expect(step1).toBe('İ');
    const step2 = toLocaleLower(step1, 'tr'); // → i
    expect(step2).toBe('i');
  });

  it('Turkish dotless ı roundtrip preserves dotless', () => {
    // ı → I → ı (all in Turkish locale)
    const step1 = toLocaleUpper('ı', 'tr'); // → I
    expect(step1).toBe('I');
    const step2 = toLocaleLower(step1, 'tr'); // → ı
    expect(step2).toBe('ı');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   buildGoogleFontsUrl
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('buildGoogleFontsUrl', () => {
  it('produces a valid URL string', () => {
    const url = buildGoogleFontsUrl('en');
    expect(url).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?/);
  });

  it('includes all three font families', () => {
    const url = buildGoogleFontsUrl('en');
    expect(url).toContain('family=Press+Start+2P');
    expect(url).toContain('family=Inter');
    expect(url).toContain('family=JetBrains+Mono');
  });

  it('includes weight specifiers for multi-weight fonts', () => {
    const url = buildGoogleFontsUrl('en');
    expect(url).toContain('Inter:wght@400;500;600;700');
    expect(url).toContain('JetBrains+Mono:wght@400;500;600;700');
  });

  it('does not include weight specifier for single-weight fonts', () => {
    const url = buildGoogleFontsUrl('en');
    // Press Start 2P has only weight 400, so no :wght@ parameter
    expect(url).toContain('family=Press+Start+2P&');
  });

  it('includes display=swap', () => {
    const url = buildGoogleFontsUrl('en');
    expect(url).toContain('display=swap');
  });

  it('English locale includes latin subset', () => {
    const url = buildGoogleFontsUrl('en');
    expect(url).toContain('subset=latin');
  });

  it('Turkish locale includes latin-ext subset', () => {
    const url = buildGoogleFontsUrl('tr');
    expect(url).toContain('subset=latin,latin-ext');
  });

  it('Turkish URL differs from English URL', () => {
    const enUrl = buildGoogleFontsUrl('en');
    const trUrl = buildGoogleFontsUrl('tr');
    expect(enUrl).not.toBe(trUrl);
  });

  it('defaults to English when no locale specified', () => {
    const defaultUrl = buildGoogleFontsUrl();
    const enUrl = buildGoogleFontsUrl('en');
    expect(defaultUrl).toBe(enUrl);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PXLKIT_FONTS configuration
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PXLKIT_FONTS', () => {
  it('defines pixel, sans, and mono font entries', () => {
    expect(PXLKIT_FONTS).toHaveProperty('pixel');
    expect(PXLKIT_FONTS).toHaveProperty('sans');
    expect(PXLKIT_FONTS).toHaveProperty('mono');
  });

  it('pixel font is Press Start 2P', () => {
    expect(PXLKIT_FONTS.pixel.googleFamily).toBe('Press Start 2P');
    expect(PXLKIT_FONTS.pixel.family).toContain('Press Start 2P');
    expect(PXLKIT_FONTS.pixel.cssVar).toBe('--font-pixel');
    expect(PXLKIT_FONTS.pixel.weights).toEqual([400]);
  });

  it('sans font is Inter', () => {
    expect(PXLKIT_FONTS.sans.googleFamily).toBe('Inter');
    expect(PXLKIT_FONTS.sans.family).toContain('Inter');
    expect(PXLKIT_FONTS.sans.cssVar).toBe('--font-sans');
    expect(PXLKIT_FONTS.sans.weights).toEqual([400, 500, 600, 700]);
  });

  it('mono font is JetBrains Mono', () => {
    expect(PXLKIT_FONTS.mono.googleFamily).toBe('JetBrains Mono');
    expect(PXLKIT_FONTS.mono.family).toContain('JetBrains Mono');
    expect(PXLKIT_FONTS.mono.cssVar).toBe('--font-mono');
    expect(PXLKIT_FONTS.mono.weights).toEqual([400, 500, 600, 700]);
  });

  it('all fonts include fallback families', () => {
    expect(PXLKIT_FONTS.pixel.family).toContain('monospace');
    expect(PXLKIT_FONTS.sans.family).toContain('sans-serif');
    expect(PXLKIT_FONTS.mono.family).toContain('monospace');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   TURKISH_CHARACTERS constant
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('TURKISH_CHARACTERS', () => {
  it('contains all six Turkish-specific lowercase letters', () => {
    expect(TURKISH_CHARACTERS.lowercase).toContain('ç');
    expect(TURKISH_CHARACTERS.lowercase).toContain('ğ');
    expect(TURKISH_CHARACTERS.lowercase).toContain('ı');
    expect(TURKISH_CHARACTERS.lowercase).toContain('ö');
    expect(TURKISH_CHARACTERS.lowercase).toContain('ş');
    expect(TURKISH_CHARACTERS.lowercase).toContain('ü');
  });

  it('contains all six Turkish-specific uppercase letters', () => {
    expect(TURKISH_CHARACTERS.uppercase).toContain('Ç');
    expect(TURKISH_CHARACTERS.uppercase).toContain('Ğ');
    expect(TURKISH_CHARACTERS.uppercase).toContain('İ');
    expect(TURKISH_CHARACTERS.uppercase).toContain('Ö');
    expect(TURKISH_CHARACTERS.uppercase).toContain('Ş');
    expect(TURKISH_CHARACTERS.uppercase).toContain('Ü');
  });

  it('sample text contains Turkish characters', () => {
    expect(TURKISH_CHARACTERS.sample).toContain('İ');
    expect(TURKISH_CHARACTERS.sample).toContain('ş');
    expect(TURKISH_CHARACTERS.sample).toContain('ü');
  });

  it('pangram contains multiple Turkish-specific characters', () => {
    const p = TURKISH_CHARACTERS.pangram;
    // Should contain: ı, ğ, ş, ö, ç, ü
    expect(p).toContain('ı');
    expect(p).toContain('ğ');
    expect(p).toContain('ş');
    expect(p).toContain('ö');
    expect(p).toContain('ç');
    expect(p).toContain('ü');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PxlKitLocaleProvider & usePxlKitLocale
   ═══════════════════════════════════════════════════════════════════════════════ */

/** Helper component to read context and render values for testing */
function LocaleInspector() {
  const { locale, upper, lower, fontsUrl } = usePxlKitLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="upper-istanbul">{upper('istanbul')}</span>
      <span data-testid="lower-ISTANBUL">{lower('ISTANBUL')}</span>
      <span data-testid="fonts-url">{fontsUrl}</span>
      <span data-testid="upper-i">{upper('i')}</span>
      <span data-testid="lower-I">{lower('I')}</span>
    </div>
  );
}

describe('PxlKitLocaleProvider', () => {
  describe('with Turkish locale', () => {
    it('provides locale="tr" to children', () => {
      render(
        <PxlKitLocaleProvider locale="tr">
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      expect(screen.getByTestId('locale').textContent).toBe('tr');
    });

    it('upper() correctly handles Turkish i → İ', () => {
      render(
        <PxlKitLocaleProvider locale="tr">
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      expect(screen.getByTestId('upper-istanbul').textContent).toBe('İSTANBUL');
      expect(screen.getByTestId('upper-i').textContent).toBe('İ');
    });

    it('lower() correctly handles Turkish I → ı', () => {
      render(
        <PxlKitLocaleProvider locale="tr">
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      expect(screen.getByTestId('lower-ISTANBUL').textContent).toBe('ıstanbul');
      expect(screen.getByTestId('lower-I').textContent).toBe('ı');
    });

    it('provides a Google Fonts URL with latin-ext subset', () => {
      render(
        <PxlKitLocaleProvider locale="tr">
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      const url = screen.getByTestId('fonts-url').textContent!;
      expect(url).toContain('latin-ext');
    });

    it('renders a wrapper div with lang="tr"', () => {
      const { container } = render(
        <PxlKitLocaleProvider locale="tr">
          <span data-testid="child">Test</span>
        </PxlKitLocaleProvider>,
      );
      const langDiv = container.querySelector('[lang="tr"]') as HTMLElement | null;
      expect(langDiv).not.toBeNull();
      expect(langDiv!.tagName.toLowerCase()).toBe('div');
      expect(langDiv!.style.display).toBe('contents');
    });
  });

  describe('with English locale', () => {
    it('provides locale="en" to children', () => {
      render(
        <PxlKitLocaleProvider locale="en">
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      expect(screen.getByTestId('locale').textContent).toBe('en');
    });

    it('upper() uses English casing (i → I)', () => {
      render(
        <PxlKitLocaleProvider locale="en">
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      expect(screen.getByTestId('upper-istanbul').textContent).toBe('ISTANBUL');
      expect(screen.getByTestId('upper-i').textContent).toBe('I');
    });

    it('lower() uses English casing (I → i)', () => {
      render(
        <PxlKitLocaleProvider locale="en">
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      expect(screen.getByTestId('lower-ISTANBUL').textContent).toBe('istanbul');
      expect(screen.getByTestId('lower-I').textContent).toBe('i');
    });
  });

  describe('default behavior (no locale prop)', () => {
    it('defaults to English locale', () => {
      render(
        <PxlKitLocaleProvider>
          <LocaleInspector />
        </PxlKitLocaleProvider>,
      );
      expect(screen.getByTestId('locale').textContent).toBe('en');
      expect(screen.getByTestId('upper-i').textContent).toBe('I');
    });
  });
});

describe('usePxlKitLocale without provider', () => {
  it('uses English defaults when no provider is present', () => {
    render(<LocaleInspector />);
    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('upper-istanbul').textContent).toBe('ISTANBUL');
    expect(screen.getByTestId('lower-ISTANBUL').textContent).toBe('istanbul');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   Edge cases & Unicode boundary testing
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('edge cases', () => {
  it('handles strings with only Turkish special chars', () => {
    expect(toLocaleUpper('çğışöü', 'tr')).toBe('ÇĞIŞÖÜ');
    expect(toLocaleLower('ÇĞIŞÖÜİ', 'tr')).toContain('ç');
  });

  it('handles numbers and punctuation (no change)', () => {
    expect(toLocaleUpper('123!@#', 'tr')).toBe('123!@#');
    expect(toLocaleLower('123!@#', 'tr')).toBe('123!@#');
  });

  it('handles strings with emoji', () => {
    expect(toLocaleUpper('merhaba 🇹🇷', 'tr')).toBe('MERHABA 🇹🇷');
  });

  it('handles single character Turkish ı correctly', () => {
    expect(toLocaleUpper('ı', 'tr')).toBe('I');
    expect(toLocaleLower('I', 'tr')).toBe('ı');
  });

  it('handles Unicode code points correctly', () => {
    // İ = U+0130, ı = U+0131
    expect(toLocaleUpper('i', 'tr').charCodeAt(0)).toBe(0x0130); // İ
    expect(toLocaleUpper('ı', 'tr').charCodeAt(0)).toBe(0x0049); // I
    expect(toLocaleLower('İ', 'tr').charCodeAt(0)).toBe(0x0069); // i
    expect(toLocaleLower('I', 'tr').charCodeAt(0)).toBe(0x0131); // ı
  });

  it('correctly differentiates between Turkish and English for same input', () => {
    // The letter 'i' in English uppercases to 'I' (U+0049)
    // The letter 'i' in Turkish uppercases to 'İ' (U+0130)
    const enResult = toLocaleUpper('i', 'en');
    const trResult = toLocaleUpper('i', 'tr');
    expect(enResult).not.toBe(trResult);
    expect(enResult).toBe('I');
    expect(trResult).toBe('İ');
  });
});
