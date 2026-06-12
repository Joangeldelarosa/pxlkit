import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelParallaxGroup } from '../../parallax/PixelParallaxGroup';

describe('PixelParallaxGroup', () => {
  it('renders children inside the container', () => {
    const { getByText } = render(
      <PixelParallaxGroup>
        <span>layered content</span>
      </PixelParallaxGroup>,
    );
    expect(getByText('layered content')).toBeTruthy();
  });

  it('renders a div by default with relative + overflow-hidden', () => {
    const { container } = render(<PixelParallaxGroup>x</PixelParallaxGroup>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('relative');
    expect(el.className).toContain('overflow-hidden');
  });

  it.each(['section', 'header', 'main'] as const)('as="%s" renders that tag', (tag) => {
    const { container } = render(<PixelParallaxGroup as={tag}>x</PixelParallaxGroup>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe(tag.toUpperCase());
  });

  it('merges className and forwards inline style', () => {
    const { container } = render(
      <PixelParallaxGroup className="custom" style={{ height: '300px' }}>x</PixelParallaxGroup>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('relative');
    expect(el.className).toContain('custom');
    expect(el.style.height).toBe('300px');
  });
});
