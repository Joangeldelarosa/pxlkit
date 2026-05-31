import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelTestimonialCard } from '../../cards/PixelTestimonialCard';

describe('PixelTestimonialCard', () => {
  it('renders quote inside blockquote', () => {
    const { container, getByText } = render(
      <PixelTestimonialCard
        quote="This kit shipped my landing page in a day."
        name="Ada Lovelace"
      />,
    );
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeTruthy();
    expect(getByText(/This kit shipped my landing page in a day\./)).toBeTruthy();
  });

  it('renders name and role', () => {
    const { getByText } = render(
      <PixelTestimonialCard
        quote="Good stuff."
        name="Ada Lovelace"
        role="Founder"
      />,
    );
    expect(getByText('Ada Lovelace')).toBeTruthy();
    expect(getByText(/Founder/)).toBeTruthy();
  });

  it('stars=5 renders 5 stars', () => {
    const { container } = render(
      <PixelTestimonialCard
        quote="Good stuff."
        name="Ada Lovelace"
        stars={5}
      />,
    );
    const stars = container.querySelectorAll('[data-pxl-star]');
    expect(stars.length).toBe(5);
  });

  it('verified=true renders verified badge', () => {
    const { container } = render(
      <PixelTestimonialCard
        quote="Good stuff."
        name="Ada Lovelace"
        verified
      />,
    );
    const badge = container.querySelector('[data-pxl-verified]');
    expect(badge).toBeTruthy();
  });

  it('quoteSize="long" applies min-h-[9em]', () => {
    const { container } = render(
      <PixelTestimonialCard
        quote="A really long quote that needs space."
        name="Ada Lovelace"
        quoteSize="long"
      />,
    );
    const slot = container.querySelector('[data-pxl-quote-slot]') as HTMLElement;
    expect(slot).toBeTruthy();
    expect(slot.className).toContain('min-h-[9em]');
  });

  it('variant="quote" omits card border classes', () => {
    const { container } = render(
      <PixelTestimonialCard
        quote="Good stuff."
        name="Ada Lovelace"
        variant="quote"
      />,
    );
    const article = container.querySelector('article') as HTMLElement;
    expect(article).toBeTruthy();
    expect(article.className).not.toContain('border-2');
    expect(article.className).not.toContain('border-retro-border');
  });

  it('avatar renders with name fallback when no src', () => {
    const { container } = render(
      <PixelTestimonialCard
        quote="Good stuff."
        name="Ada Lovelace"
        avatar={{ name: 'Ada Lovelace' }}
      />,
    );
    const avatar = container.querySelector('[data-pxl-avatar]') as HTMLElement;
    expect(avatar).toBeTruthy();
    // Initials "AL" fallback
    expect(avatar.textContent).toContain('AL');
  });
});
