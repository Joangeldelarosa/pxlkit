import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelHeroSection } from '../../hero/PixelHeroSection';

describe('PixelHeroSection', () => {
  it('renders headline as h1', () => {
    const { container } = render(
      <PixelHeroSection headline="Build pixel UIs in minutes" />,
    );
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toContain('Build pixel UIs in minutes');
  });

  it('eyebrow renders when provided', () => {
    const { getByText } = render(
      <PixelHeroSection eyebrow="v2 is here" headline="Hello world" />,
    );
    expect(getByText('v2 is here')).toBeTruthy();
  });

  it('variant="split" renders two columns when media provided', () => {
    const { getByTestId } = render(
      <PixelHeroSection
        data-testid="hero"
        variant="split"
        headline="Split hero"
        media={<div data-testid="media">media content</div>}
      />,
    );
    const hero = getByTestId('hero');
    const grid = hero.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain('grid-cols-1');
    expect(getByTestId('media')).toBeInTheDocument();
  });

  it('minHeight="lg" applies min-h-[640px]', () => {
    const { getByTestId } = render(
      <PixelHeroSection
        data-testid="hero"
        headline="Tall hero"
        minHeight="lg"
      />,
    );
    expect(getByTestId('hero').className).toContain('min-h-[640px]');
  });

  it('primaryCta and secondaryCta render in a cluster', () => {
    const { getByTestId } = render(
      <PixelHeroSection
        headline="CTA hero"
        primaryCta={<button data-testid="primary">Primary</button>}
        secondaryCta={<button data-testid="secondary">Secondary</button>}
      />,
    );
    const primary = getByTestId('primary');
    const secondary = getByTestId('secondary');
    expect(primary).toBeInTheDocument();
    expect(secondary).toBeInTheDocument();
    // Both CTAs share the same flex/cluster parent
    expect(primary.parentElement).toBe(secondary.parentElement);
    expect(primary.parentElement?.className).toContain('flex');
  });

  it('omits subline div when subline prop not provided', () => {
    const { container } = render(
      <PixelHeroSection headline="No subline here" />,
    );
    // No <p> element should be rendered because there's no subline
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });
});
