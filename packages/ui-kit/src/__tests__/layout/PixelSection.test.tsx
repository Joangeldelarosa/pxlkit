import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelSection } from '../../layout';

describe('PixelSection (upgrade)', () => {
  it('renders without a title (title is optional)', () => {
    const { container, queryByRole } = render(
      <PixelSection>
        <p>body</p>
      </PixelSection>,
    );
    expect(queryByRole('heading', { level: 3 })).toBeNull();
    expect(container.querySelector('section')).not.toBeNull();
    expect(container.textContent).toContain('body');
  });

  it('renders heading when title is provided', () => {
    const { getByRole } = render(
      <PixelSection title="hello">
        <p>body</p>
      </PixelSection>,
    );
    const h = getByRole('heading', { level: 3 });
    expect(h.textContent?.toLowerCase()).toContain('hello');
  });

  it('wraps content in PixelCenter container by default (max-w-[1600px])', () => {
    const { container } = render(
      <PixelSection>
        <p data-testid="body">body</p>
      </PixelSection>,
    );
    // PixelCenter applies max-w-[1600px] by default ('5xl')
    expect(container.innerHTML).toContain('max-w-[1600px]');
  });

  it('container={false} disables the centered wrapper and applies horizontalGutter on section', () => {
    const { container } = render(
      <PixelSection container={false} horizontalGutter="md">
        <p>body</p>
      </PixelSection>,
    );
    const section = container.querySelector('section')!;
    expect(section.className).toContain('px-4');
    expect(section.className).toContain('sm:px-6');
    // no inner PixelCenter wrapper width applied
    expect(container.innerHTML).not.toContain('max-w-[1600px]');
  });

  it('verticalPadding="xl" applies py-20 sm:py-28 lg:py-32 by default', () => {
    const { container } = render(
      <PixelSection>
        <p>body</p>
      </PixelSection>,
    );
    const section = container.querySelector('section')!;
    expect(section.className).toContain('py-20');
    expect(section.className).toContain('sm:py-28');
    expect(section.className).toContain('lg:py-32');
  });

  it('verticalPadding="none" applies py-0', () => {
    const { container } = render(
      <PixelSection verticalPadding="none">
        <p>body</p>
      </PixelSection>,
    );
    const section = container.querySelector('section')!;
    expect(section.className).toContain('py-0');
  });

  it('container="prose" forwards to PixelCenter (max-w-prose)', () => {
    const { container } = render(
      <PixelSection container="prose">
        <p>body</p>
      </PixelSection>,
    );
    expect(container.innerHTML).toContain('max-w-prose');
  });
});
