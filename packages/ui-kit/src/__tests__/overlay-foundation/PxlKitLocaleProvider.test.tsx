import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  PxlKitLocaleProvider,
  usePxlKitLocale,
} from '../../overlay-foundation/PxlKitLocaleProvider';
import { PixelSection } from '../../layout/PixelSection';

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
   Nested PxlKitLocaleProvider — inner overrides outer
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('Nested PxlKitLocaleProvider', () => {
  it('inner Turkish provider overrides outer English provider', () => {
    render(
      <PxlKitLocaleProvider locale="en">
        <PxlKitLocaleProvider locale="tr">
          <PixelSection title="istanbul">
            <p>content</p>
          </PixelSection>
        </PxlKitLocaleProvider>
      </PxlKitLocaleProvider>,
    );
    const heading = document.querySelector('h3');
    // Inner provider is Turkish, so "istanbul" → "İSTANBUL"
    expect(heading!.textContent).toBe('İSTANBUL');
  });

  it('inner English provider overrides outer Turkish provider', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PxlKitLocaleProvider locale="en">
          <PixelSection title="istanbul">
            <p>content</p>
          </PixelSection>
        </PxlKitLocaleProvider>
      </PxlKitLocaleProvider>,
    );
    const heading = document.querySelector('h3');
    // Inner provider is English, so "istanbul" → "ISTANBUL"
    expect(heading!.textContent).toBe('ISTANBUL');
  });

  it('nested providers set correct lang attributes', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="en">
        <PxlKitLocaleProvider locale="tr">
          <span data-testid="inner">Test</span>
        </PxlKitLocaleProvider>
      </PxlKitLocaleProvider>,
    );
    // Both lang divs should exist
    expect(container.querySelector('div[lang="en"]')).not.toBeNull();
    expect(container.querySelector('div[lang="tr"]')).not.toBeNull();
    // Inner child should be inside the tr div
    const trDiv = container.querySelector('div[lang="tr"]');
    expect(trDiv!.querySelector('[data-testid="inner"]')).not.toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   CSS lang attribute — ensures provider sets lang for CSS text-transform
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PxlKitLocaleProvider lang attribute', () => {
  it('sets lang="tr" on wrapper div for Turkish', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="tr">
        <span>Test</span>
      </PxlKitLocaleProvider>,
    );
    const wrapper = container.querySelector('div[lang="tr"]') as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    expect(wrapper!.style.display).toBe('contents');
  });

  it('sets lang="en" on wrapper div for English', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="en">
        <span>Test</span>
      </PxlKitLocaleProvider>,
    );
    const wrapper = container.querySelector('div[lang="en"]');
    expect(wrapper).not.toBeNull();
  });

  it('display:contents does not create a layout box', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="tr">
        <span data-testid="child">Content</span>
      </PxlKitLocaleProvider>,
    );
    const wrapper = container.querySelector('div[lang="tr"]') as HTMLElement | null;
    expect(wrapper!.style.display).toBe('contents');
    // The child should still be accessible
    expect(screen.getByTestId('child')).not.toBeNull();
  });
});
