import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelBento } from '../../layout/PixelBento';
import { PixelBentoCell } from '../../layout/PixelBentoCell';

describe('PixelBentoCell', () => {
  it('span="2x2" applies col-span (clamped on mobile) + row-span-2', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" span="2x2" />
      </PixelBento>,
    );
    const el = getByTestId('cell');
    // Mobile: 1 col so spans clamp; sm and up: 2-col span
    expect(el.className).toContain('col-span-1');
    expect(el.className).toContain('sm:col-span-2');
    expect(el.className).toContain('row-span-2');
    expect(el.getAttribute('data-span')).toBe('2x2');
  });

  it('kind="stat" renders a stat-style layout (deprecated alias)', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" kind="stat">
          <span>42</span>
        </PixelBentoCell>
      </PixelBento>,
    );
    const el = getByTestId('cell');
    expect(el.getAttribute('data-kind')).toBe('stat');
  });

  it('variant takes precedence over the deprecated kind alias', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" variant="media" kind="stat" />
      </PixelBento>,
    );
    expect(getByTestId('cell').getAttribute('data-kind')).toBe('media');
  });

  it('tone="purple" bordered applies purple border', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" tone="purple" bordered />
      </PixelBento>,
    );
    const el = getByTestId('cell');
    expect(el.className).toContain('border-retro-purple/30');
  });

  it('renders without border chrome by default (bordered=false)', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" tone="purple" />
      </PixelBento>,
    );
    expect(getByTestId('cell').className).not.toContain('border-retro-purple/30');
  });
});
