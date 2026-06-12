import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelPagination } from '../../navigation/PixelPagination';

describe('PixelPagination — rendering', () => {
  it('renders every page button when total <= 7 (no ellipses)', () => {
    const { getByRole, queryByText } = render(
      <PixelPagination page={1} total={5} onChange={() => {}} />,
    );
    for (let i = 1; i <= 5; i++) {
      expect(getByRole('button', { name: String(i) })).toBeTruthy();
    }
    expect(queryByText('…')).toBeNull();
  });

  it('windows large totals with ellipses on both sides around the current page', () => {
    const { getByRole, queryByRole, getAllByText } = render(
      <PixelPagination page={10} total={20} onChange={() => {}} />,
    );
    // [1, …, 9, 10, 11, …, 20]
    expect(getByRole('button', { name: '1' })).toBeTruthy();
    expect(getByRole('button', { name: '9' })).toBeTruthy();
    expect(getByRole('button', { name: '10' })).toBeTruthy();
    expect(getByRole('button', { name: '11' })).toBeTruthy();
    expect(getByRole('button', { name: '20' })).toBeTruthy();
    expect(queryByRole('button', { name: '5' })).toBeNull();
    expect(getAllByText('…').length).toBe(2);
  });

  it('marks the current page with aria-current=page', () => {
    const { getByRole } = render(
      <PixelPagination page={3} total={5} onChange={() => {}} />,
    );
    expect(getByRole('button', { name: '3' }).getAttribute('aria-current')).toBe('page');
    expect(getByRole('button', { name: '2' }).getAttribute('aria-current')).toBeNull();
  });

  it('renders a nav landmark with the default label and localizable prev/next labels', () => {
    const { getByRole } = render(
      <PixelPagination
        page={1}
        total={3}
        onChange={() => {}}
        ariaLabel="Paginación"
        prevLabel="Anterior"
        nextLabel="Siguiente"
      />,
    );
    expect(getByRole('navigation', { name: 'Paginación' })).toBeTruthy();
    expect(getByRole('button', { name: 'Anterior' })).toBeTruthy();
    expect(getByRole('button', { name: 'Siguiente' })).toBeTruthy();
  });
});

describe('PixelPagination — callbacks & boundaries', () => {
  it('clicking a page number fires onChange with that page', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <PixelPagination page={1} total={5} onChange={onChange} />,
    );
    fireEvent.click(getByRole('button', { name: '4' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('Prev fires onChange(page - 1) and Next fires onChange(page + 1)', () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <PixelPagination page={3} total={5} onChange={onChange} />,
    );
    fireEvent.click(getByRole('button', { name: 'Prev' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(getByRole('button', { name: 'Next' }));
    expect(onChange).toHaveBeenLastCalledWith(4);
  });

  it('Prev is disabled on the first page; Next is disabled on the last', () => {
    const onChange = vi.fn();
    const { getByRole, rerender } = render(
      <PixelPagination page={1} total={5} onChange={onChange} />,
    );
    const prev = getByRole('button', { name: 'Prev' }) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    fireEvent.click(prev);
    expect(onChange).not.toHaveBeenCalled();

    rerender(<PixelPagination page={5} total={5} onChange={onChange} />);
    const next = getByRole('button', { name: 'Next' }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.click(next);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('siblings widens the window around the current page', () => {
    const { getByRole } = render(
      <PixelPagination page={10} total={20} siblings={2} onChange={() => {}} />,
    );
    // [1, …, 8, 9, 10, 11, 12, …, 20]
    for (const p of [8, 9, 10, 11, 12]) {
      expect(getByRole('button', { name: String(p) })).toBeTruthy();
    }
  });

  it('forwards ref to the nav element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<PixelPagination ref={ref} page={1} total={3} onChange={() => {}} />);
    expect(ref.current?.tagName).toBe('NAV');
  });
});
