import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { PixelHeroSection } from '../../hero/PixelHeroSection';
import { mockMatchMedia } from '../animations/matchmedia-mock';

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

  describe('headlineEffect', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('types the headline out, which screen readers get whole from the start', () => {
      vi.useFakeTimers();
      const { container } = render(<PixelHeroSection headline="Loading" headlineEffect="typewriter" />);
      const heading = screen.getByRole('heading', { level: 1, name: 'Loading' });
      const typed = heading.querySelector('[aria-hidden="true"]')!;
      // Nothing typed yet: the caret alone.
      expect(typed.textContent).toBe('▌');
      act(() => { vi.advanceTimersByTime(60 * 3); });
      expect(typed.textContent).toBe('Loa▌');
      act(() => { vi.advanceTimersByTime(60 * 10); });
      expect(typed.textContent).toBe('Loading');
      // The headline keeps its own font and colour.
      expect(heading.firstElementChild!.className).not.toMatch(/font-mono|text-retro-green/);
      expect(container.querySelectorAll('h1')).toHaveLength(1);
    });

    // Regression: the glitch wrapped the heading and repeated it in its two
    // colour layers, so the page had three <h1>; inside the heading, the
    // layers still put its text in the document three times.
    it('glitches the headline inside its one heading, its text once, the copies drawn by CSS', () => {
      const { container } = render(<PixelHeroSection headline="Signal lost" headlineEffect="glitch" />);
      expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1);
      const heading = screen.getByRole('heading', { level: 1, name: 'Signal lost' });
      expect(heading.textContent).toBe('Signal lost');
      expect(heading.querySelectorAll('[aria-hidden]')).toHaveLength(0);
      const glitch = heading.firstElementChild as HTMLElement;
      expect(glitch.tagName).toBe('SPAN');
      expect(glitch.dataset.text).toBe('Signal lost');
      expect(glitch.classList.contains('pxl-glitch-copies')).toBe(true);
      expect((glitch.firstElementChild as HTMLElement).style.animation).toContain('pxl-glitch');
    });

    it('holds still when the user prefers reduced motion', () => {
      const ctl = mockMatchMedia(true);
      try {
        const { container, unmount } = render(<PixelHeroSection headline="Signal lost" headlineEffect="glitch" />);
        expect(container.querySelectorAll('h1')).toHaveLength(1);
        expect(container.querySelector('.pxl-glitch-copies')).toBeNull();
        unmount();
        render(<PixelHeroSection headline="Loading" headlineEffect="typewriter" />);
        const heading = screen.getByRole('heading', { level: 1, name: 'Loading' });
        expect(heading.querySelector('[aria-hidden="true"]')!.textContent).toBe('Loading');
      } finally {
        ctl.restore();
      }
    });

    it('renders the plain headline by default', () => {
      const { container } = render(<PixelHeroSection headline="Plain" />);
      expect(container.querySelector('h1')!.innerHTML).toBe('Plain');
    });
  });

  it('sets the headline at the level `as` gives, in the same type, with any effect', () => {
    const { container } = render(
      <>
        <PixelHeroSection headline="Default" />
        <PixelHeroSection as="h2" headline="Plain" />
        <PixelHeroSection as="h3" headline="Typed" headlineEffect="typewriter" />
        <PixelHeroSection as="h6" headline="Glitched" headlineEffect="glitch" />
      </>,
    );
    const h1 = screen.getByRole('heading', { level: 1, name: 'Default' });
    expect(screen.getByRole('heading', { level: 2, name: 'Plain' }).className).toBe(h1.className);
    expect(screen.getByRole('heading', { level: 3, name: 'Typed' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 6, name: 'Glitched' })).toBeInTheDocument();
    expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(4);
  });
});

