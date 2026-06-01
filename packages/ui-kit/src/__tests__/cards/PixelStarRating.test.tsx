import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelStarRating } from '../../cards/PixelStarRating';

describe('PixelStarRating', () => {
  it('renders max (default 5) star elements', () => {
    const { container } = render(<PixelStarRating value={0} data-testid="rating" />);
    const stars = container.querySelectorAll('[data-pxl-star]');
    expect(stars.length).toBe(5);
  });

  it('value=3 renders 3 filled and 2 outlined', () => {
    const { container } = render(<PixelStarRating value={3} />);
    const filled = container.querySelectorAll('[data-pxl-star="filled"]');
    const outlined = container.querySelectorAll('[data-pxl-star="outlined"]');
    expect(filled.length).toBe(3);
    expect(outlined.length).toBe(2);
  });

  it('tone="gold" applies gold fill class', () => {
    const { container } = render(<PixelStarRating value={3} tone="gold" />);
    const filled = container.querySelector('[data-pxl-star="filled"]') as HTMLElement;
    expect(filled).toBeTruthy();
    expect(filled.className).toContain('text-retro-gold');
  });

  it('interactive=true renders buttons and onChange fires with correct index', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PixelStarRating value={2} interactive onChange={onChange} />,
    );
    const buttons = container.querySelectorAll('button[data-pxl-star]');
    expect(buttons.length).toBe(5);
    fireEvent.click(buttons[3]);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('showCount renders "3/5"', () => {
    const { getByText } = render(<PixelStarRating value={3} showCount />);
    expect(getByText('3/5')).toBeTruthy();
  });

  it('default filled stars render gamification Star via PxlKitIcon img', () => {
    const { container } = render(<PixelStarRating value={3} />);
    const imgs = container.querySelectorAll('[data-pxl-star="filled"] img[alt="star"]');
    expect(imgs.length).toBe(3);
  });

  it('default outlined stars render inline rect-svg', () => {
    const { container } = render(<PixelStarRating value={3} />);
    const svg = container.querySelector('[data-pxl-star="outlined"] svg');
    expect(svg).toBeTruthy();
  });

  it('starIcon prop overrides default glyph for filled positions', () => {
    const { container } = render(
      <PixelStarRating value={2} starIcon={<span data-testid="custom-glyph" />} />,
    );
    const customs = container.querySelectorAll('[data-pxl-star="filled"] [data-testid="custom-glyph"]');
    expect(customs.length).toBe(2);
  });
});
