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

describe('PxlKitLocaleProvider lang attribute', () => {
  it('sets lang="tr" on wrapper div for Turkish', () => {
    const { container } = render(
      <PxlKitLocaleProvider locale="tr">
        <span>Test</span>
      </PxlKitLocaleProvider>,
    );
    const wrapper = container.querySelector('div[lang="tr"]');
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
    const wrapper = container.querySelector('div[lang="tr"]');
    expect(wrapper!.style.display).toBe('contents');
    // The child should still be accessible
    expect(screen.getByTestId('child')).not.toBeNull();
  });
});
