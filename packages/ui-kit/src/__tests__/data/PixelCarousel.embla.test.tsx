import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { EmblaCarouselType } from 'embla-carousel';
import { PixelCarousel } from '../../data/PixelCarousel';

/* With the real Embla (PixelCarousel.test.tsx mocks it): Embla needs
   matchMedia, IntersectionObserver and ResizeObserver, which jsdom lacks. */

function Slides({ setApi }: { setApi?: (api: EmblaCarouselType | undefined) => void }) {
  return (
    <PixelCarousel aria-label="Featured" showDots setApi={setApi}>
      <PixelCarousel.Item>One</PixelCarousel.Item>
      <PixelCarousel.Item>Two</PixelCarousel.Item>
      <PixelCarousel.Item>Three</PixelCarousel.Item>
    </PixelCarousel>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PixelCarousel with Embla', () => {
  it('stays on its first slide where Embla cannot run, instead of unmounting the page', () => {
    const setApi = vi.fn();
    render(<Slides setApi={setApi} />);
    expect(screen.getByRole('region', { name: 'Featured' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Slide 1 of 3');
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /go to slide/i })).toHaveLength(3);
    expect(setApi).toHaveBeenLastCalledWith(undefined);
  });

  it('runs Embla on the viewport where the browser has what it needs', () => {
    class Observer {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal('IntersectionObserver', Observer);
    vi.stubGlobal('ResizeObserver', Observer);
    const setApi = vi.fn();
    const { unmount } = render(<Slides setApi={setApi} />);
    const api = setApi.mock.calls.at(-1)?.[0] as EmblaCarouselType | undefined;
    expect(api?.rootNode()).toBe(document.getElementById(screen.getByRole('button', { name: 'Next slide' }).getAttribute('aria-controls')!));
    expect(api?.slideNodes()).toHaveLength(3);
    unmount();
    expect(setApi).toHaveBeenLastCalledWith(undefined);
  });
});
