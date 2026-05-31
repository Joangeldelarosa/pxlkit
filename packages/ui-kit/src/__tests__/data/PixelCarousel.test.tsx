import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

// Mock embla so we can spy on scrollPrev/scrollNext and control state.
const scrollPrev = vi.fn();
const scrollNext = vi.fn();
const scrollTo = vi.fn();
let mockApi: {
  scrollPrev: typeof scrollPrev;
  scrollNext: typeof scrollNext;
  scrollTo: typeof scrollTo;
  scrollSnapList: () => number[];
  selectedScrollSnap: () => number;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  on: (evt: string, cb: () => void) => void;
  off: (evt: string, cb: () => void) => void;
};
let lastOptions: Record<string, unknown> | undefined;

vi.mock('embla-carousel-react', () => {
  return {
    default: (opts?: Record<string, unknown>) => {
      lastOptions = opts;
      const ref = () => {};
      return [ref, mockApi];
    },
  };
});

import { PixelCarousel } from '../../data/PixelCarousel';

beforeEach(() => {
  scrollPrev.mockReset();
  scrollNext.mockReset();
  scrollTo.mockReset();
  lastOptions = undefined;
  mockApi = {
    scrollPrev,
    scrollNext,
    scrollTo,
    scrollSnapList: () => [0, 1, 2],
    selectedScrollSnap: () => 0,
    canScrollPrev: () => true,
    canScrollNext: () => true,
    on: () => {},
    off: () => {},
  };
});

describe('PixelCarousel', () => {
  it('renders children inside carousel viewport', () => {
    const { getByTestId, getByRole } = render(
      <PixelCarousel>
        <PixelCarousel.Item>
          <div data-testid="slide-1">Slide 1</div>
        </PixelCarousel.Item>
        <PixelCarousel.Item>
          <div data-testid="slide-2">Slide 2</div>
        </PixelCarousel.Item>
      </PixelCarousel>,
    );
    expect(getByTestId('slide-1')).toBeInTheDocument();
    expect(getByTestId('slide-2')).toBeInTheDocument();
    // Carousel role + roledescription
    const root = getByRole('region');
    expect(root).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('previous button calls embla.scrollPrev', () => {
    const { getByLabelText } = render(
      <PixelCarousel>
        <PixelCarousel.Item>A</PixelCarousel.Item>
        <PixelCarousel.Item>B</PixelCarousel.Item>
      </PixelCarousel>,
    );
    fireEvent.click(getByLabelText(/previous slide/i));
    expect(scrollPrev).toHaveBeenCalledTimes(1);
  });

  it('next button calls embla.scrollNext', () => {
    const { getByLabelText } = render(
      <PixelCarousel>
        <PixelCarousel.Item>A</PixelCarousel.Item>
        <PixelCarousel.Item>B</PixelCarousel.Item>
      </PixelCarousel>,
    );
    fireEvent.click(getByLabelText(/next slide/i));
    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  it('dots reflect slide count', () => {
    const { getAllByRole } = render(
      <PixelCarousel showDots>
        <PixelCarousel.Item>A</PixelCarousel.Item>
        <PixelCarousel.Item>B</PixelCarousel.Item>
        <PixelCarousel.Item>C</PixelCarousel.Item>
      </PixelCarousel>,
    );
    // Dots are buttons with aria-label "Go to slide N"
    const dots = getAllByRole('button').filter((b) =>
      /go to slide/i.test(b.getAttribute('aria-label') ?? ''),
    );
    expect(dots).toHaveLength(3);
  });

  it('orientation=vertical sets vertical axis', () => {
    render(
      <PixelCarousel orientation="vertical">
        <PixelCarousel.Item>A</PixelCarousel.Item>
        <PixelCarousel.Item>B</PixelCarousel.Item>
      </PixelCarousel>,
    );
    expect(lastOptions?.axis).toBe('y');
  });
});
