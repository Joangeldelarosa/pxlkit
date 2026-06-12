import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelTextLink } from '../../data/PixelTextLink';

describe('PixelTextLink — anchor mode (href)', () => {
  it('renders an <a> with the given href and children', () => {
    const { container } = render(
      <PixelTextLink href="/docs">Read the docs</PixelTextLink>,
    );
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a!.getAttribute('href')).toBe('/docs');
    expect(a!.textContent).toBe('Read the docs');
    expect(container.querySelector('button')).toBeNull();
  });

  it('forwards anchor attributes (target, rel)', () => {
    const { container } = render(
      <PixelTextLink href="https://pxlkit.xyz" target="_blank" rel="noopener">
        x
      </PixelTextLink>,
    );
    const a = container.querySelector('a')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener');
  });
});

describe('PixelTextLink — button mode (no href)', () => {
  it('renders a <button type="button"> when href is omitted', () => {
    const { container } = render(<PixelTextLink>act</PixelTextLink>);
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.getAttribute('type')).toBe('button');
    expect(container.querySelector('a')).toBeNull();
  });

  it('fires onClick when activated', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PixelTextLink onClick={onClick}>act</PixelTextLink>,
    );
    fireEvent.click(container.querySelector('button')!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('PixelTextLink — tone + styling', () => {
  it('defaults to tone="cyan" with the green hover swap', () => {
    const { container } = render(<PixelTextLink href="/x">x</PixelTextLink>);
    const a = container.querySelector('a') as HTMLElement;
    expect(a.className).toContain('text-retro-cyan');
    expect(a.className).toContain('hover:text-retro-green');
    expect(a.className).toContain('underline');
  });

  it('non-cyan tones use the opacity hover instead', () => {
    const { container } = render(
      <PixelTextLink href="/x" tone="gold">x</PixelTextLink>,
    );
    const a = container.querySelector('a') as HTMLElement;
    expect(a.className).toContain('text-retro-gold');
    expect(a.className).toContain('hover:opacity-80');
    expect(a.className).not.toContain('hover:text-retro-green');
  });

  it('merges a caller className onto the root', () => {
    const { container } = render(
      <PixelTextLink href="/x" className="custom-cls">x</PixelTextLink>,
    );
    expect(container.querySelector('a')!.className).toContain('custom-cls');
  });

  it('keeps a focus-visible ring for keyboard users', () => {
    const { container } = render(<PixelTextLink>x</PixelTextLink>);
    const btn = container.querySelector('button') as HTMLElement;
    expect(btn.className).toContain('focus-visible:ring-2');
  });
});
