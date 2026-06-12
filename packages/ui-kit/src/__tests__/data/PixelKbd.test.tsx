import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelKbd } from '../../data/PixelKbd';

describe('PixelKbd — rendering', () => {
  it('renders children inside a <kbd> element', () => {
    const { container } = render(<PixelKbd>Esc</PixelKbd>);
    const kbd = container.querySelector('kbd');
    expect(kbd).not.toBeNull();
    expect(kbd!.textContent).toBe('Esc');
  });

  it('keeps the keycap chrome (border + surface bg + muted text)', () => {
    const { container } = render(<PixelKbd>K</PixelKbd>);
    const kbd = container.querySelector('kbd') as HTMLElement;
    expect(kbd.className).toContain('border-retro-border');
    expect(kbd.className).toContain('bg-retro-surface');
    expect(kbd.className).toContain('text-retro-muted');
  });
});

describe('PixelKbd — surface', () => {
  it('default pixel surface uses the deeper 2px keycap shadow + mono font', () => {
    const { container } = render(<PixelKbd>⌘</PixelKbd>);
    const kbd = container.querySelector('kbd') as HTMLElement;
    expect(kbd.className).toContain('shadow-[0_2px_0_0_rgba(0,0,0,0.25)]');
    expect(kbd.className).toContain('font-mono');
    expect(kbd.className).toContain('pxl-corner-sm');
  });

  it('surface="linear" uses the shallow 1px shadow + rounded corner', () => {
    const { container } = render(<PixelKbd surface="linear">⌘</PixelKbd>);
    const kbd = container.querySelector('kbd') as HTMLElement;
    expect(kbd.className).toContain('shadow-[0_1px_0_0_rgba(0,0,0,0.15)]');
    expect(kbd.className).toContain('rounded-md');
    expect(kbd.className).not.toContain('shadow-[0_2px_0_0_rgba(0,0,0,0.25)]');
  });
});
