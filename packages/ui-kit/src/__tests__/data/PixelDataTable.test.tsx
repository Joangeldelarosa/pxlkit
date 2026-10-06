import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PixelDataTable } from '../../data/PixelDataTable';

type Person = { id: string; name: string; age: number };

const people: Person[] = [
  { id: '1', name: 'Ada', age: 36 },
  { id: '2', name: 'Linus', age: 54 },
  { id: '3', name: 'Grace', age: 85 },
];

const columns: ColumnDef<Person>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', enableSorting: true },
  { id: 'age', accessorKey: 'age', header: 'Age', enableSorting: true },
];

describe('PixelDataTable', () => {
  it('renders table with header and rows', () => {
    const { getByText, getAllByRole } = render(
      <PixelDataTable data={people} columns={columns} />,
    );
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('Ada')).toBeTruthy();
    expect(getByText('Linus')).toBeTruthy();
    expect(getByText('Grace')).toBeTruthy();
    // 1 header row + 3 body rows
    expect(getAllByRole('row').length).toBe(4);
  });

  it('clicking sortable header calls onSortingChange', () => {
    const onSortingChange = vi.fn();
    const { getByRole } = render(
      <PixelDataTable
        data={people}
        columns={columns}
        sorting={[]}
        onSortingChange={onSortingChange}
      />,
    );
    const nameSort = getByRole('button', { name: /sort by name/i });
    fireEvent.click(nameSort);
    expect(onSortingChange).toHaveBeenCalledTimes(1);
    const next = onSortingChange.mock.calls[0][0];
    expect(Array.isArray(next)).toBe(true);
    expect(next[0]).toEqual({ id: 'name', desc: false });
  });

  it('uncontrolled: clicking sortable header reorders rows without any state props', () => {
    // Use the Name column (string) — TanStack sorts strings ascending by default.
    const { getByRole, getAllByRole } = render(
      <PixelDataTable data={people} columns={columns} />,
    );
    // Original: Ada, Linus, Grace. Asc by name → Ada, Grace, Linus.
    const nameSort = getByRole('button', { name: /sort by name/i });
    fireEvent.click(nameSort);
    const rows = getAllByRole('row');
    expect(rows[1].textContent).toContain('Ada');
    expect(rows[2].textContent).toContain('Grace');
    expect(rows[3].textContent).toContain('Linus');
    // Click again to flip → Linus, Grace, Ada
    fireEvent.click(nameSort);
    const rows2 = getAllByRole('row');
    expect(rows2[1].textContent).toContain('Linus');
    expect(rows2[2].textContent).toContain('Grace');
    expect(rows2[3].textContent).toContain('Ada');
  });

  it('uncontrolled: header has aria-sort that reflects internal sort state', () => {
    const { getByRole } = render(
      <PixelDataTable data={people} columns={columns} />,
    );
    const nameTh = getByRole('columnheader', { name: /name/i });
    expect(nameTh.getAttribute('aria-sort')).toBe('none');
    fireEvent.click(getByRole('button', { name: /sort by name/i }));
    expect(nameTh.getAttribute('aria-sort')).toBe('ascending');
    fireEvent.click(getByRole('button', { name: /sort by name/i }));
    expect(nameTh.getAttribute('aria-sort')).toBe('descending');
  });

  it('loading=true renders skeleton rows', () => {
    const { container, queryByText } = render(
      <PixelDataTable data={people} columns={columns} loading />,
    );
    // Body cells should NOT show real data when loading.
    expect(queryByText('Ada')).toBeNull();
    const skeletons = container.querySelectorAll('[data-skeleton]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('exposes its loading status to assistive technology (no aria-hidden around it)', () => {
    const { getByRole } = render(<PixelDataTable data={people} columns={columns} loading />);
    expect(getByRole('status')).toHaveTextContent('Loading data…');
  });

  it('empty data shows emptyState', () => {
    const { getByText } = render(
      <PixelDataTable
        data={[]}
        columns={columns}
        emptyState={<div>No people yet</div>}
      />,
    );
    expect(getByText('No people yet')).toBeTruthy();
  });

  it('density=compact applies compact padding', () => {
    const { container } = render(
      <PixelDataTable data={people} columns={columns} density="compact" />,
    );
    const td = container.querySelector('tbody td');
    expect(td).toBeTruthy();
    expect(td!.className).toMatch(/py-1/);
  });

  it('row selection updates via checkbox column', () => {
    const onRowSelectionChange = vi.fn();
    const { container } = render(
      <PixelDataTable
        data={people}
        columns={columns}
        rowSelection={{}}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => row.id}
      />,
    );
    const checkboxes = container.querySelectorAll('tbody input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);
    fireEvent.click(checkboxes[0]);
    expect(onRowSelectionChange).toHaveBeenCalledTimes(1);
    const next = onRowSelectionChange.mock.calls[0][0];
    expect(next['1']).toBe(true);
  });

  it('pagination buttons fire onPaginationChange', () => {
    const onPaginationChange = vi.fn();
    const big: Person[] = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `P${i}`,
      age: 20 + i,
    }));
    const { getByRole } = render(
      <PixelDataTable
        data={big}
        columns={columns}
        pagination={{ pageIndex: 0, pageSize: 5 }}
        onPaginationChange={onPaginationChange}
      />,
    );
    const nextBtn = getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);
    expect(onPaginationChange).toHaveBeenCalledTimes(1);
    const next = onPaginationChange.mock.calls[0][0];
    expect(next.pageIndex).toBe(1);
    expect(next.pageSize).toBe(5);
  });

  it('shows every row without the pagination bar once pagination is unbound, and pages again once bound', () => {
    const big: Person[] = Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `P${i}`, age: 20 + i }));
    const { container, rerender, queryByRole } = render(
      <PixelDataTable data={big} columns={columns} pagination={{ pageIndex: 1, pageSize: 5 }} />,
    );
    const names = () => Array.from(container.querySelectorAll('tbody tr'), (row) => row.querySelector('td')!.textContent);
    expect(names()).toEqual(['P5', 'P6', 'P7', 'P8', 'P9']);
    rerender(<PixelDataTable data={big} columns={columns} />);
    expect(names()).toHaveLength(12);
    expect(queryByRole('combobox', { name: 'Rows per page' })).toBeNull();
    rerender(<PixelDataTable data={big} columns={columns} pagination={{ pageIndex: 2, pageSize: 5 }} />);
    expect(names()).toEqual(['P10', 'P11']);
    expect(queryByRole('combobox', { name: 'Rows per page' })).not.toBeNull();
  });

  it("reports the table's own resets to the first page, with pagination bound or not", async () => {
    const big: Person[] = Array.from({ length: 12 }, (_, i) => ({ id: String(i), name: `P${i}`, age: 20 + i }));
    // TanStack resets the page in a microtask, from its second row model on.
    const settle = () => act(async () => {});
    const bound = vi.fn();
    const { getByRole, unmount } = render(
      <PixelDataTable data={big} columns={columns} pagination={{ pageIndex: 1, pageSize: 5 }} onPaginationChange={bound} />,
    );
    await settle();
    fireEvent.click(getByRole('button', { name: /sort by age/i }));
    await settle();
    expect(bound.mock.calls).toEqual([[{ pageIndex: 0, pageSize: 5 }]]);
    unmount();

    const unbound = vi.fn();
    const { container, getByRole: getUnboundByRole } = render(
      <PixelDataTable data={big} columns={columns} onPaginationChange={unbound} />,
    );
    await settle();
    fireEvent.click(getUnboundByRole('button', { name: /sort by age/i }));
    await settle();
    expect(unbound.mock.calls).toEqual([[{ pageIndex: 0, pageSize: 10 }]]);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(12);
  });

  it('shows the current page size in the rows-per-page select, also one outside the standard sizes', () => {
    const { getByRole } = render(
      <PixelDataTable data={people} columns={columns} pagination={{ pageIndex: 0, pageSize: 2 }} />,
    );
    const select = getByRole('combobox', { name: 'Rows per page' }) as HTMLSelectElement;
    expect(select.value).toBe('2');
    expect(Array.from(select.options, (option) => option.value)).toEqual(['2', '5', '10', '20', '50']);
  });

  it('makes clickable rows focusable and activates them with Enter and Space, not from a control inside', () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <PixelDataTable data={people} columns={columns} rowSelection={{}} onRowClick={onRowClick} />,
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[2].getAttribute('tabindex')).toBe('0');
    expect(fireEvent.keyDown(rows[2], { key: 'Enter' })).toBe(false);
    fireEvent.keyDown(rows[0], { key: ' ' });
    fireEvent.keyDown(rows[0], { key: 'Escape' });
    fireEvent.keyDown(rows[0].querySelector('input')!, { key: ' ' });
    expect(onRowClick.mock.calls).toEqual([[people[2]], [people[0]]]);
    const { container: plain } = render(<PixelDataTable data={people} columns={columns} />);
    expect(plain.querySelector('tbody tr')!.hasAttribute('tabindex')).toBe(false);
  });
});
