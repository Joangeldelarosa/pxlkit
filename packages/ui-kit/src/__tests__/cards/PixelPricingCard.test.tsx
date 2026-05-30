import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelPricingCard } from '../../cards/PixelPricingCard';

describe('PixelPricingCard', () => {
  it('renders name as h3', () => {
    const { getByRole } = render(
      <PixelPricingCard name="Pro" price={{ amount: 29 }} />,
    );
    const h3 = getByRole('heading', { level: 3 });
    expect(h3.textContent).toBe('Pro');
  });

  it('renders price.amount', () => {
    const { getByTestId } = render(
      <PixelPricingCard data-testid="card" name="Pro" price={{ amount: '$29' }} />,
    );
    const card = getByTestId('card');
    expect(card.textContent).toContain('$29');
  });

  it('renders price.period when provided', () => {
    const { getByTestId } = render(
      <PixelPricingCard
        data-testid="card"
        name="Pro"
        price={{ amount: 29, period: '/mo' }}
      />,
    );
    const card = getByTestId('card');
    expect(card.textContent).toContain('/mo');
  });

  it('renders price.strikethrough with line-through class on a semantic <s> element', () => {
    const { container } = render(
      <PixelPricingCard
        name="Pro"
        price={{ amount: 29, strikethrough: 49 }}
      />,
    );
    const strike = container.querySelector('s');
    expect(strike).not.toBeNull();
    expect(strike!.className).toContain('line-through');
    expect(strike!.textContent).toContain('49');
    expect(strike!.textContent).toContain('Previous price');
  });

  it('reserves space for popular ribbon slot when popular not provided', () => {
    const { getByTestId } = render(
      <PixelPricingCard data-testid="card" name="Pro" price={{ amount: 29 }} />,
    );
    const card = getByTestId('card');
    const spacer = card.querySelector('[data-pxl-ribbon-slot]');
    expect(spacer).not.toBeNull();
    expect(spacer!.className).toContain('h-7');
  });

  it('renders ribbon when popular provided', () => {
    const { getByText } = render(
      <PixelPricingCard
        name="Pro"
        price={{ amount: 29 }}
        popular={{ label: 'BEST VALUE' }}
      />,
    );
    expect(getByText('BEST VALUE')).toBeInTheDocument();
  });

  it('renders one li per feature', () => {
    const { container } = render(
      <PixelPricingCard
        name="Pro"
        price={{ amount: 29 }}
        features={[
          { label: 'A' },
          { label: 'B' },
          { label: 'C' },
        ]}
      />,
    );
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(3);
  });

  it('features with included=false render with line-through and a sr-only prefix', () => {
    const { container } = render(
      <PixelPricingCard
        name="Pro"
        price={{ amount: 29 }}
        features={[
          { label: 'Included thing', included: true },
          { label: 'Excluded thing', included: false },
        ]}
      />,
    );
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
    const excludedSpan = items[1].querySelector('span:not([aria-hidden]):not(.sr-only)');
    expect(excludedSpan).not.toBeNull();
    expect((excludedSpan as HTMLElement).className).toContain('line-through');
    expect(excludedSpan!.textContent).toContain('Not included');
    expect(excludedSpan!.textContent).toContain('Excluded thing');
    const includedSpan = items[0].querySelector('span:not([aria-hidden]):not(.sr-only)');
    expect(includedSpan!.textContent).toContain('Included:');
  });

  it('highlight=true adds glow class', () => {
    const { getByTestId } = render(
      <PixelPricingCard
        data-testid="card"
        name="Pro"
        price={{ amount: 29 }}
        tone="cyan"
        highlight
      />,
    );
    const card = getByTestId('card');
    expect(card.className).toContain('shadow-[0_0_24px_-8px_rgba(14,165,233,0.45)]');
  });

  it('description slot reserves min-h even without description prop', () => {
    const { getByTestId } = render(
      <PixelPricingCard data-testid="card" name="Pro" price={{ amount: 29 }} />,
    );
    const card = getByTestId('card');
    const desc = card.querySelector('[data-pxl-description-slot]');
    expect(desc).not.toBeNull();
    expect(desc!.className).toContain('min-h-[2.5em]');
  });
});
