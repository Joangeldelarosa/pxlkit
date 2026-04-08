import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { PxlKitLocaleProvider } from '../locale';
import { PixelSection, PixelDivider } from '../layout';
import { PixelAvatar } from '../data-display';
import { PixelModal } from '../overlay';

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelSection — locale-aware title uppercasing
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelSection with Turkish locale', () => {
  it('uppercases title using Turkish rules when wrapped in provider', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelSection title="işlem detayları">
          <p>content</p>
        </PixelSection>
      </PxlKitLocaleProvider>,
    );
    // "işlem detayları" in Turkish uppercase → "İŞLEM DETAYLARI"
    const heading = document.querySelector('h3');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toContain('İ'); // dotted İ, not dotless I
  });

  it('uppercases title using English rules without provider', () => {
    render(
      <PixelSection title="istanbul">
        <p>content</p>
      </PixelSection>,
    );
    const heading = document.querySelector('h3');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe('ISTANBUL');
  });

  it('uppercases title using English rules when locale is en', () => {
    render(
      <PxlKitLocaleProvider locale="en">
        <PixelSection title="istanbul">
          <p>content</p>
        </PixelSection>
      </PxlKitLocaleProvider>,
    );
    const heading = document.querySelector('h3');
    expect(heading!.textContent).toBe('ISTANBUL');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelAvatar — locale-aware initials
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelAvatar with Turkish locale', () => {
  it('generates correct initials for Turkish names', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelAvatar name="işıl gündüz" />
      </PxlKitLocaleProvider>,
    );
    // "işıl gündüz" → initials "i" + "g" → Turkish uppercase → "İG"
    const avatar = document.querySelector('[title="işıl gündüz"]');
    expect(avatar).not.toBeNull();
    expect(avatar!.textContent).toBe('İG');
  });

  it('generates correct initials for English names', () => {
    render(
      <PxlKitLocaleProvider locale="en">
        <PixelAvatar name="John Doe" />
      </PxlKitLocaleProvider>,
    );
    const avatar = document.querySelector('[title="John Doe"]');
    expect(avatar!.textContent).toBe('JD');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelModal — locale-aware title uppercasing
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelModal with Turkish locale', () => {
  it('uppercases modal title using Turkish rules', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelModal open={true} title="işlem bilgisi" onClose={() => {}}>
          <p>Modal content</p>
        </PixelModal>
      </PxlKitLocaleProvider>,
    );
    const heading = document.querySelector('h4');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toContain('İ'); // dotted İ
  });

  it('does not render when closed', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelModal open={false} title="test" onClose={() => {}}>
          <p>Hidden</p>
        </PixelModal>
      </PxlKitLocaleProvider>,
    );
    const heading = document.querySelector('h4');
    expect(heading).toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   CSS lang attribute — ensures provider sets lang for CSS text-transform
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelDivider — CSS class "uppercase" under lang attr
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelDivider with Turkish locale', () => {
  it('renders label text inside a span with CSS uppercase class', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="tr">
        <PixelDivider label="bilgi" tone="green" />
      </PxlKitLocaleProvider>,
    );
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
    // The span should have the CSS 'uppercase' class (Tailwind)
    expect(span!.className).toContain('uppercase');
    // Text content is the raw label — CSS handles visual uppercasing
    expect(span!.textContent).toBe('bilgi');
  });

  it('inherits lang="tr" from the provider wrapper div', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="tr">
        <PixelDivider label="işlem" tone="cyan" />
      </PxlKitLocaleProvider>,
    );
    // The wrapper div with lang="tr" should contain the divider
    const langDiv = container.querySelector('div[lang="tr"]');
    expect(langDiv).not.toBeNull();
    const span = langDiv!.querySelector('span');
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe('işlem');
  });

  it('renders without label (just an hr)', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="tr">
        <PixelDivider />
      </PxlKitLocaleProvider>,
    );
    const hr = container.querySelector('hr');
    expect(hr).not.toBeNull();
    // No span should be rendered when label is undefined
    const span = container.querySelector('span');
    expect(span).toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelSection — additional Turkish edge cases
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelSection — full Turkish title verification', () => {
  it('uppercases "istanbul şehir bilgileri" correctly', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelSection title="istanbul şehir bilgileri">
          <p>content</p>
        </PixelSection>
      </PxlKitLocaleProvider>,
    );
    const heading = document.querySelector('h3');
    expect(heading!.textContent).toBe('İSTANBUL ŞEHİR BİLGİLERİ');
  });

  it('renders subtitle unchanged (not uppercased)', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelSection title="bilgi" subtitle="bu bir alt başlık">
          <p>content</p>
        </PixelSection>
      </PxlKitLocaleProvider>,
    );
    const subtitle = document.querySelector('p.mt-2');
    expect(subtitle).not.toBeNull();
    expect(subtitle!.textContent).toBe('bu bir alt başlık');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelAvatar — edge cases
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelAvatar — edge cases', () => {
  it('handles single word Turkish name', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelAvatar name="ilker" />
      </PxlKitLocaleProvider>,
    );
    const avatar = document.querySelector('[title="ilker"]');
    expect(avatar).not.toBeNull();
    // "ilker" → initial "i" → Turkish uppercase → "İ"
    expect(avatar!.textContent).toBe('İ');
  });

  it('handles three-word Turkish name (takes first two initials)', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelAvatar name="ibrahim kemal ilhan" />
      </PxlKitLocaleProvider>,
    );
    const avatar = document.querySelector('[title="ibrahim kemal ilhan"]');
    expect(avatar).not.toBeNull();
    // "ibrahim kemal ilhan" → "i" + "k" + "i" → slice(0,2) → "ik" → Turkish uppercase → "İK"
    expect(avatar!.textContent).toBe('İK');
  });

  it('handles name starting with dotless ı', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelAvatar name="ışık deniz" />
      </PxlKitLocaleProvider>,
    );
    const avatar = document.querySelector('[title="ışık deniz"]');
    expect(avatar).not.toBeNull();
    // "ışık deniz" → "ı" + "d" → Turkish uppercase → "ID"
    expect(avatar!.textContent).toBe('ID');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
   PixelModal — full title verification
   ═══════════════════════════════════════════════════════════════════════════════ */

describe('PixelModal — full Turkish title verification', () => {
  it('uppercases "silme işlemi" correctly', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelModal open={true} title="silme işlemi" onClose={() => {}}>
          <p>content</p>
        </PixelModal>
      </PxlKitLocaleProvider>,
    );
    const heading = document.querySelector('h4');
    expect(heading!.textContent).toBe('SİLME İŞLEMİ');
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
