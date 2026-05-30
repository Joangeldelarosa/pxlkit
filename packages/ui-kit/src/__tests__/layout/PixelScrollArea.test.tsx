import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelScrollArea } from '../../layout/PixelScrollArea';

describe('PixelScrollArea', () => {
  it('renders children inside scroll container', () => {
    const { getByTestId, getByText } = render(
      <PixelScrollArea data-testid="sa">
        <p>Hello inside</p>
      </PixelScrollArea>,
    );
    const el = getByTestId('sa');
    expect(el).toBeTruthy();
    expect(getByText('Hello inside')).toBeTruthy();
    expect(el.contains(getByText('Hello inside'))).toBe(true);
  });

  it('applies maxHeight as inline style (number → px)', () => {
    const { getByTestId } = render(
      <PixelScrollArea data-testid="sa" maxHeight={240}>
        <div>x</div>
      </PixelScrollArea>,
    );
    const el = getByTestId('sa') as HTMLDivElement;
    expect(el.style.maxHeight).toBe('240px');
  });

  it('applies maxHeight as inline style (string passthrough)', () => {
    const { getByTestId } = render(
      <PixelScrollArea data-testid="sa" maxHeight="50vh">
        <div>x</div>
      </PixelScrollArea>,
    );
    const el = getByTestId('sa') as HTMLDivElement;
    expect(el.style.maxHeight).toBe('50vh');
  });

  it('type="always" marks scrollbar as always visible', () => {
    const { getByTestId } = render(
      <PixelScrollArea data-testid="sa" type="always">
        <div>x</div>
      </PixelScrollArea>,
    );
    const el = getByTestId('sa');
    expect(el.getAttribute('data-scrollbar')).toBe('always');
    expect(el.className).toContain('pxl-scroll-always');
  });

  it('forwards className', () => {
    const { getByTestId } = render(
      <PixelScrollArea data-testid="sa" className="custom-cls">
        <div>x</div>
      </PixelScrollArea>,
    );
    const el = getByTestId('sa');
    expect(el.className).toContain('custom-cls');
  });
});
