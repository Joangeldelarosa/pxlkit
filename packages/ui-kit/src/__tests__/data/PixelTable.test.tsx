import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelTable } from '../../data/PixelTable';

/* Extracted from __tests__/data-display.test.tsx (Ola 4a additive upgrade)
   into the mirrored per-component file. */

describe('PixelTable — legacy behavior preserved', () => {
  it('renders headers + rows from the legacy columns/data shape', () => {
    const cols = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];
    const rows = [
      { name: 'Alice', role: 'Admin' },
      { name: 'Bob', role: 'User' },
    ];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const ths = container.querySelectorAll('th');
    expect(ths.length).toBe(2);
    expect(ths[0].textContent).toBe('Name');
    const tds = container.querySelectorAll('tbody td');
    expect(tds.length).toBe(4);
    expect(tds[0].textContent).toBe('Alice');
    expect(tds[3].textContent).toBe('User');
  });

  it('applies striped class on odd rows by default', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }, { n: 'b' }, { n: 'c' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const trs = container.querySelectorAll('tbody tr');
    expect(trs[1].className).toContain('bg-retro-surface/15');
    expect(trs[0].className).not.toContain('bg-retro-surface/15');
  });

  it('forwards legacy column.className to th and td', () => {
    const cols = [{ key: 'n', header: 'N', className: 'legacy-col-cls' }];
    const rows = [{ n: 'a' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const th = container.querySelector('th')!;
    const td = container.querySelector('tbody td')!;
    expect(th.className).toContain('legacy-col-cls');
    expect(td.className).toContain('legacy-col-cls');
  });
});

describe('PixelTable — columns + data drives header + rows', () => {
  it('uses column.render when provided, falling back to row[key]', () => {
    type R = { id: string; name: string };
    const cols = [
      { key: 'name', header: 'Name' },
      { key: 'badge', header: 'Tag', render: (row: R) => <span data-testid={`b-${row.id}`}>★{row.name}</span> },
    ];
    const rows: R[] = [{ id: '1', name: 'Ann' }];
    const { getByTestId, container } = render(<PixelTable<R> columns={cols} data={rows} />);
    expect(getByTestId('b-1').textContent).toBe('★Ann');
    const tds = container.querySelectorAll('tbody td');
    expect(tds[0].textContent).toBe('Ann');
  });

  it('applies align className when column.align is set', () => {
    const cols = [
      { key: 'n', header: 'N', align: 'right' as const },
    ];
    const rows = [{ n: 'a' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const th = container.querySelector('th')!;
    const td = container.querySelector('tbody td')!;
    expect(th.className).toContain('text-right');
    expect(td.className).toContain('text-right');
  });

  it('applies column.width as inline style', () => {
    const cols = [
      { key: 'n', header: 'N', width: 120 },
      { key: 'm', header: 'M', width: '40%' },
    ];
    const rows = [{ n: 'a', m: 'b' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const ths = container.querySelectorAll('th');
    expect((ths[0] as HTMLElement).style.width).toBe('120px');
    expect((ths[1] as HTMLElement).style.width).toBe('40%');
  });
});

describe('PixelTable — sortable header', () => {
  it('renders a sort button when column.sortable is true and onSortChange is set', () => {
    const cols = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age' },
    ];
    const rows = [{ name: 'a', age: '1' }];
    const onSort = vi.fn();
    const { container } = render(
      <PixelTable columns={cols} data={rows} onSortChange={onSort} />,
    );
    const buttons = container.querySelectorAll('th button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('aria-label')).toBe('Sort by Name');
  });

  it('fires onSortChange with asc on first click of an unsorted column', () => {
    const cols = [{ key: 'name', header: 'Name', sortable: true }];
    const rows = [{ name: 'a' }];
    const onSort = vi.fn();
    const { container } = render(
      <PixelTable columns={cols} data={rows} onSortChange={onSort} />,
    );
    const button = container.querySelector('th button')!;
    fireEvent.click(button);
    expect(onSort).toHaveBeenCalledWith({ key: 'name', dir: 'asc' });
  });

  it('toggles asc -> desc when clicked again on same column', () => {
    const cols = [{ key: 'name', header: 'Name', sortable: true }];
    const rows = [{ name: 'a' }];
    const onSort = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        sort={{ key: 'name', dir: 'asc' }}
        onSortChange={onSort}
      />,
    );
    const button = container.querySelector('th button')!;
    fireEvent.click(button);
    expect(onSort).toHaveBeenCalledWith({ key: 'name', dir: 'desc' });
  });

  it('sets aria-sort to ascending/descending/none on sortable columns', () => {
    const cols = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age', sortable: true },
      { key: 'tag', header: 'Tag' },
    ];
    const rows = [{ name: 'a', age: '1', tag: 't' }];
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        sort={{ key: 'name', dir: 'desc' }}
        onSortChange={vi.fn()}
      />,
    );
    const ths = container.querySelectorAll('th');
    expect(ths[0].getAttribute('aria-sort')).toBe('descending');
    expect(ths[1].getAttribute('aria-sort')).toBe('none');
    expect(ths[2].getAttribute('aria-sort')).toBeNull();
  });

  it('uncontrolled: renders a sort button when column.sortable is true even without onSortChange', () => {
    const cols = [{ key: 'name', header: 'Name', sortable: true }];
    const rows = [{ name: 'a' }];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    expect(container.querySelectorAll('th button').length).toBe(1);
  });

  it('uncontrolled: clicking sort header reorders rows by the sorted column', () => {
    const cols = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'age', header: 'Age', sortable: true },
    ];
    const rows = [
      { id: 'a', name: 'Charlie', age: 30 },
      { id: 'b', name: 'Alice', age: 25 },
      { id: 'c', name: 'Bob', age: 28 },
    ];
    const { container } = render(<PixelTable columns={cols} data={rows} />);
    const nameBtn = container.querySelectorAll('th button')[0] as HTMLButtonElement;
    fireEvent.click(nameBtn);
    const bodyRows = container.querySelectorAll('tbody tr');
    expect(bodyRows[0].textContent).toContain('Alice');
    expect(bodyRows[1].textContent).toContain('Bob');
    expect(bodyRows[2].textContent).toContain('Charlie');
    // aria-sort reflects the internal state
    const nameTh = container.querySelectorAll('th')[0];
    expect(nameTh.getAttribute('aria-sort')).toBe('ascending');
    fireEvent.click(nameBtn);
    expect(nameTh.getAttribute('aria-sort')).toBe('descending');
  });
});

describe('PixelTable — selection', () => {
  it('renders a header checkbox + row checkboxes when selection="multi"', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={[]}
        onSelectionChange={vi.fn()}
        getRowId={(r) => r.id}
      />,
    );
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3); // 1 header + 2 rows
    expect(checkboxes[0].getAttribute('aria-label')).toBe('Select all rows');
  });

  it('toggles a row when its checkbox is clicked (multi)', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const onSel = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={[]}
        onSelectionChange={onSel}
        getRowId={(r) => r.id}
      />,
    );
    const rowCheckboxes = Array.from(container.querySelectorAll('tbody input[type="checkbox"]'));
    fireEvent.click(rowCheckboxes[1]);
    expect(onSel).toHaveBeenCalledWith(['r2']);
  });

  it('selecting all via header checkbox emits all row ids', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const onSel = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={[]}
        onSelectionChange={onSel}
        getRowId={(r) => r.id}
      />,
    );
    const headerCb = container.querySelector('thead input[type="checkbox"]')!;
    fireEvent.click(headerCb);
    expect(onSel).toHaveBeenCalledWith(['r1', 'r2']);
  });

  it('replaces the previous selection when selection="single"', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const onSel = vi.fn();
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="single"
        selectedIds={['r1']}
        onSelectionChange={onSel}
        getRowId={(r) => r.id}
      />,
    );
    // single mode: no header checkbox (sr-only span)
    expect(container.querySelector('thead input[type="checkbox"]')).toBeNull();
    const rowCheckboxes = Array.from(container.querySelectorAll('tbody input[type="checkbox"]'));
    fireEvent.click(rowCheckboxes[1]);
    expect(onSel).toHaveBeenCalledWith(['r2']);
  });

  it('marks selected rows with data-selected attr + selected bg class', () => {
    const cols = [{ key: 'name', header: 'Name' }];
    const rows = [{ id: 'r1', name: 'a' }, { id: 'r2', name: 'b' }];
    const { container } = render(
      <PixelTable
        columns={cols}
        data={rows}
        selection="multi"
        selectedIds={['r1']}
        onSelectionChange={vi.fn()}
        getRowId={(r) => r.id}
      />,
    );
    const trs = container.querySelectorAll('tbody tr');
    expect(trs[0].getAttribute('data-selected')).toBe('true');
    expect(trs[0].className).toContain('bg-retro-surface/40');
    expect(trs[1].getAttribute('data-selected')).toBeNull();
  });
});

describe('PixelTable — loading state', () => {
  it('renders skeleton rows when loading is true', () => {
    const cols = [{ key: 'a', header: 'A' }, { key: 'b', header: 'B' }];
    const { container } = render(<PixelTable columns={cols} data={[]} loading />);
    const skels = container.querySelectorAll('[data-skeleton]');
    // 5 skeleton rows * 2 cols
    expect(skels.length).toBe(10);
  });

  it('does not render the empty-state message while loading', () => {
    const cols = [{ key: 'a', header: 'A' }];
    const { container } = render(
      <PixelTable columns={cols} data={[]} loading emptyState={<span>NOPE</span>} />,
    );
    expect(container.textContent).not.toContain('NOPE');
  });
});

describe('PixelTable — empty state', () => {
  it('renders the default empty placeholder when data is empty', () => {
    const cols = [{ key: 'a', header: 'A' }];
    const { container } = render(<PixelTable columns={cols} data={[]} />);
    expect(container.textContent).toContain('No data.');
  });

  it('renders a custom emptyState node when provided', () => {
    const cols = [{ key: 'a', header: 'A' }];
    render(
      <PixelTable columns={cols} data={[]} emptyState={<span data-testid="empty">Nothing here</span>} />,
    );
    expect(screen.getByTestId('empty').textContent).toBe('Nothing here');
  });
});

describe('PixelTable — row click', () => {
  it('fires onRowClick with row + index', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }, { n: 'b' }];
    const onClick = vi.fn();
    const { container } = render(
      <PixelTable columns={cols} data={rows} onRowClick={onClick} />,
    );
    const trs = container.querySelectorAll('tbody tr');
    fireEvent.click(trs[1]);
    expect(onClick).toHaveBeenCalledWith({ n: 'b' }, 1);
    expect(trs[1].className).toContain('cursor-pointer');
  });
});

describe('PixelTable — density', () => {
  it('uses compact padding when density="compact"', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} density="compact" />,
    );
    const td = container.querySelector('tbody td')!;
    expect(td.className).toContain('px-3');
    expect(td.className).toContain('py-1');
  });

  it('uses comfortable padding when density="comfortable"', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} density="comfortable" />,
    );
    const td = container.querySelector('tbody td')!;
    expect(td.className).toContain('py-4');
  });
});

describe('PixelTable — sticky header / first column', () => {
  it('applies sticky top class to thead when stickyHeader is set', () => {
    const cols = [{ key: 'n', header: 'N' }];
    const rows = [{ n: 'a' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} stickyHeader />,
    );
    const thead = container.querySelector('thead')!;
    expect(thead.className).toContain('sticky');
    expect(thead.className).toContain('top-0');
  });

  it('applies sticky left class to first column when stickyFirstColumn is set', () => {
    const cols = [{ key: 'a', header: 'A' }, { key: 'b', header: 'B' }];
    const rows = [{ a: '1', b: '2' }];
    const { container } = render(
      <PixelTable columns={cols} data={rows} stickyFirstColumn />,
    );
    const ths = container.querySelectorAll('th');
    expect(ths[0].className).toContain('sticky');
    expect(ths[0].className).toContain('left-0');
    expect(ths[1].className).not.toContain('sticky');
  });
});
