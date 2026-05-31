import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
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
});
