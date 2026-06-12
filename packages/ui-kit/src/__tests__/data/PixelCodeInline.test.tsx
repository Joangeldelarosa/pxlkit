import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelCodeInline } from '../../data/PixelCodeInline';

describe('PixelCodeInline — rendering', () => {
  it('renders children inside a <code> element', () => {
    const { container } = render(<PixelCodeInline>npm install</PixelCodeInline>);
    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code!.textContent).toBe('npm install');
  });

  it('renders nested nodes, not just strings', () => {
    const { container } = render(
      <PixelCodeInline>
        <span data-testid="inner">pxlToVoxels()</span>
      </PixelCodeInline>,
    );
    expect(container.querySelector('code [data-testid="inner"]')).not.toBeNull();
  });
});

describe('PixelCodeInline — tone', () => {
  it('defaults to tone="cyan" (border + soft bg + text)', () => {
    const { container } = render(<PixelCodeInline>x</PixelCodeInline>);
    const code = container.querySelector('code') as HTMLElement;
    expect(code.className).toContain('border-retro-cyan/40');
    expect(code.className).toContain('bg-retro-cyan/8');
    expect(code.className).toContain('text-retro-cyan');
  });

  it('tone="red" swaps the tone classes', () => {
    const { container } = render(<PixelCodeInline tone="red">x</PixelCodeInline>);
    const code = container.querySelector('code') as HTMLElement;
    expect(code.className).toContain('text-retro-red');
    expect(code.className).not.toContain('text-retro-cyan');
  });
});

describe('PixelCodeInline — surface', () => {
  it('default pixel surface uses border-2 + staircase corners + mono font', () => {
    const { container } = render(<PixelCodeInline>x</PixelCodeInline>);
    const code = container.querySelector('code') as HTMLElement;
    expect(code.className).toContain('border-2');
    expect(code.className).toContain('pxl-corner-sm');
    expect(code.className).toContain('font-mono');
  });

  it('surface="linear" uses rounded corners + sans font', () => {
    const { container } = render(
      <PixelCodeInline surface="linear">x</PixelCodeInline>,
    );
    const code = container.querySelector('code') as HTMLElement;
    expect(code.className).toContain('rounded-md');
    expect(code.className).toContain('font-sans');
    expect(code.className).not.toContain('pxl-corner-sm');
  });
});
