import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelIconFrame } from '../../cards/PixelIconFrame';

describe('PixelIconFrame', () => {
  it('renders icon inside fixed-size frame', () => {
    const { getByTestId } = render(
      <PixelIconFrame data-testid="frame" icon={<span data-testid="ico">x</span>} />,
    );
    const frame = getByTestId('frame');
    const icon = getByTestId('ico');
    expect(frame.contains(icon)).toBe(true);
    expect(frame.className).toMatch(/w-\d+/);
    expect(frame.className).toMatch(/h-\d+/);
  });

  it('size=64 applies w-16 h-16', () => {
    const { getByTestId } = render(
      <PixelIconFrame data-testid="frame" icon={<span>x</span>} size={64} />,
    );
    const frame = getByTestId('frame');
    expect(frame.className).toContain('w-16');
    expect(frame.className).toContain('h-16');
  });

  it('tone="cyan" applies cyan border class', () => {
    const { getByTestId } = render(
      <PixelIconFrame data-testid="frame" icon={<span>x</span>} tone="cyan" />,
    );
    const frame = getByTestId('frame');
    expect(frame.className).toContain('border-retro-cyan/30');
  });

  it('shape="circle" applies rounded-full', () => {
    const { getByTestId } = render(
      <PixelIconFrame data-testid="frame" icon={<span>x</span>} shape="circle" />,
    );
    const frame = getByTestId('frame');
    expect(frame.className).toContain('rounded-full');
  });

  it('accent renders icon in named corner when provided', () => {
    const { getByTestId } = render(
      <PixelIconFrame
        data-testid="frame"
        icon={<span>x</span>}
        accent={{ icon: <span data-testid="accent">!</span>, position: 'bottom-right' }}
      />,
    );
    const accent = getByTestId('accent');
    expect(accent).toBeTruthy();
    const accentWrapper = accent.parentElement!;
    expect(accentWrapper.className).toContain('absolute');
    expect(accentWrapper.className).toContain('bottom-0');
    expect(accentWrapper.className).toContain('right-0');
  });
});
