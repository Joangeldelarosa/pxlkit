import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelHeroMedia } from '../../hero/PixelHeroMedia';

describe('PixelHeroMedia', () => {
  it('renders children inside aspect ratio container', () => {
    const { getByTestId } = render(
      <PixelHeroMedia data-testid="media">
        <span data-testid="child">inside</span>
      </PixelHeroMedia>,
    );
    const el = getByTestId('media');
    const child = getByTestId('child');
    expect(el.contains(child)).toBe(true);
  });

  it('ratio="1/1" applies aspectRatio:"1 / 1" inline style', () => {
    const { getByTestId } = render(
      <PixelHeroMedia data-testid="media" ratio="1/1">
        <span />
      </PixelHeroMedia>,
    );
    const el = getByTestId('media') as HTMLElement;
    expect(el.style.aspectRatio).toBe('1 / 1');
  });

  it('framed=true adds border class', () => {
    const { getByTestId } = render(
      <PixelHeroMedia data-testid="media" framed>
        <span />
      </PixelHeroMedia>,
    );
    const el = getByTestId('media');
    expect(el.className).toContain('border-2');
  });

  it('caption renders when provided', () => {
    const { getByText } = render(
      <PixelHeroMedia caption="Hero shot of the product">
        <span />
      </PixelHeroMedia>,
    );
    expect(getByText('Hero shot of the product')).toBeInTheDocument();
  });

  it('tone="cyan" applies cyan border class', () => {
    const { getByTestId } = render(
      <PixelHeroMedia data-testid="media" tone="cyan" framed>
        <span />
      </PixelHeroMedia>,
    );
    const el = getByTestId('media');
    expect(el.className).toContain('border-retro-cyan/30');
  });
});
