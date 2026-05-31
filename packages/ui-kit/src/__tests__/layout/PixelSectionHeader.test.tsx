import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelSectionHeader } from '../../layout/PixelSectionHeader';

describe('PixelSectionHeader', () => {
  it('renders title as h2 by default', () => {
    const { container } = render(<PixelSectionHeader title="Hello world" />);
    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2?.textContent).toBe('Hello world');
  });

  it('as="h1" renders h1', () => {
    const { container } = render(<PixelSectionHeader as="h1" title="Big heading" />);
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe('Big heading');
    expect(container.querySelector('h2')).toBeNull();
  });

  it('eyebrow renders when provided', () => {
    const { getByText } = render(
      <PixelSectionHeader eyebrow="Introducing" title="Hello" />,
    );
    expect(getByText('Introducing')).toBeTruthy();
  });

  it('description omitted when not provided', () => {
    const { container } = render(<PixelSectionHeader title="Hello" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('align="center" applies text-center to container', () => {
    const { getByTestId } = render(
      <PixelSectionHeader data-testid="hdr" title="Centered" align="center" />,
    );
    const inner = getByTestId('hdr').firstElementChild as HTMLElement;
    expect(inner.className).toContain('text-center');
    expect(inner.className).toContain('mx-auto');
  });
});
