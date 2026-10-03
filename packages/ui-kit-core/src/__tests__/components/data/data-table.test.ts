import { describe, expect, it } from 'vitest';
import {
  DATA_TABLE_NEXT_PAGE_LABEL,
  DATA_TABLE_PAGE_SIZES,
  DATA_TABLE_PAGE_SIZE_LABEL,
  DATA_TABLE_PREVIOUS_PAGE_LABEL,
  DATA_TABLE_SELECT_COLUMN,
  dataTableAriaSort,
  dataTableClasses,
  dataTableColumnFilters,
  dataTableFilterRecord,
  dataTablePageNumber,
  dataTablePageRange,
  dataTablePageSizes,
  dataTablePaginationClasses,
  clickableRowClasses,
  dataTableRowClasses,
  dataTableSkeletonRows,
  dataTableSortGlyphClasses,
  focusRing,
  resolveDataTableUpdater,
  surfaceClasses,
  tableSkeletonClasses,
} from '../../../index';

describe('data table state', () => {
  it('resolves TanStack updaters from the previous value', () => {
    expect(resolveDataTableUpdater(3, 1)).toBe(3);
    expect(resolveDataTableUpdater((previous: number) => previous + 1, 1)).toBe(2);
  });

  it('turns the filtering record into column filters and back, values as text', () => {
    expect(dataTableColumnFilters({ name: 'al', role: '' })).toEqual([
      { id: 'name', value: 'al' },
      { id: 'role', value: '' },
    ]);
    expect(dataTableFilterRecord([{ id: 'name', value: 'al' }, { id: 'age', value: 30 }, { id: 'tag', value: undefined }])).toEqual({
      name: 'al',
      age: '30',
      tag: '',
    });
  });

  it('gives aria-sort to sorted and sortable headers only', () => {
    expect(dataTableAriaSort('asc', true)).toBe('ascending');
    expect(dataTableAriaSort('desc', true)).toBe('descending');
    expect(dataTableAriaSort(false, true)).toBe('none');
    expect(dataTableAriaSort(false, false)).toBeUndefined();
    expect(DATA_TABLE_SELECT_COLUMN).toBe('__select__');
  });

  it('shows up to a page of skeleton rows, at most five', () => {
    expect(dataTableSkeletonRows(2)).toBe(2);
    expect(dataTableSkeletonRows(10)).toBe(5);
    expect(dataTableSkeletonRows(0)).toBe(5);
  });
});

describe('data table pagination', () => {
  it('counts the rows the page shows', () => {
    expect(dataTablePageRange(0, 2, 5)).toEqual({ start: 1, end: 2 });
    expect(dataTablePageRange(2, 2, 5)).toEqual({ start: 5, end: 5 });
    expect(dataTablePageRange(0, 10, 0)).toEqual({ start: 0, end: 0 });
    expect(dataTablePageNumber(1, 3)).toBe(2);
    expect(dataTablePageNumber(0, 0)).toBe(0);
  });

  it('offers the standard page sizes, and the current one in order when it is another', () => {
    expect(DATA_TABLE_PAGE_SIZES).toEqual([5, 10, 20, 50]);
    expect(dataTablePageSizes(10)).toEqual([5, 10, 20, 50]);
    expect(dataTablePageSizes(2)).toEqual([2, 5, 10, 20, 50]);
    expect(dataTablePageSizes(25)).toEqual([5, 10, 20, 25, 50]);
    expect(dataTablePageSizes(100)).toEqual([5, 10, 20, 50, 100]);
  });

  it('labels the page controls', () => {
    expect([DATA_TABLE_PAGE_SIZE_LABEL, DATA_TABLE_PREVIOUS_PAGE_LABEL, DATA_TABLE_NEXT_PAGE_LABEL]).toEqual([
      'Rows per page',
      'Previous page',
      'Next page',
    ]);
  });
});

describe('data table recipes', () => {
  it('frames the table, rules its header by surface and sticks it on demand', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const rule = surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border';
      const classes = dataTableClasses(surface, { density: 'normal', bordered: true, stickyHeader: true });
      expect(classes.wrapper).toBe(`overflow-x-auto ${s.border} ${s.radius} border-retro-border`);
      expect(classes.table).toBe(`w-full text-left text-sm ${s.font}`);
      expect(classes.head).toBe(`bg-retro-surface/60 ${rule} sticky top-0 z-10`);
      expect(classes.sortButton).toBe(
        `inline-flex items-center gap-1 text-left text-retro-muted hover:text-retro-text outline-none ${focusRing} ${s.transition}`,
      );
      expect(classes.skeleton).toBe(tableSkeletonClasses(surface));
      const pagination = dataTablePaginationClasses(surface);
      expect(pagination.bar).toBe(
        `flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-retro-muted ${s.font} ${
          surface === 'pixel' ? 'border-t-2 border-retro-border' : 'border-t border-retro-border'
        }`,
      );
      expect(pagination.pageSizeSelect).toBe(
        `bg-retro-surface/40 px-1 py-0.5 text-retro-text outline-none ${s.border} ${s.radius} ${focusRing} border-retro-border-strong`,
      );
      expect(pagination.pageButton).toBe(
        `px-2 py-1 text-retro-text outline-none disabled:opacity-50 disabled:cursor-not-allowed ${s.border} ${s.radius} ${focusRing} border-retro-border-strong hover:bg-retro-surface/40`,
      );
    }
    const plain = dataTableClasses('pixel', { density: 'compact', bordered: false, stickyHeader: false });
    expect(plain.wrapper).toBe('overflow-x-auto');
    expect(plain.head).toBe('bg-retro-surface/60 border-b-2 border-retro-border');
  });

  it('pads the cells by density', () => {
    const classes = dataTableClasses('pixel', { density: 'compact', bordered: true, stickyHeader: false });
    expect(classes.headCell).toBe('whitespace-nowrap text-xs font-semibold text-retro-muted px-3 py-1');
    expect(classes.cell).toBe('text-retro-text px-3 py-1');
    expect(classes.skeletonRow).toBe('border-b border-retro-border/20');
    expect(classes.skeletonCell).toBe('px-3 py-1');
    expect(classes.emptyCell).toBe('text-center text-retro-muted px-3 py-1');
  });

  it('tints odd rows, and marks clickable and selected rows', () => {
    expect(dataTableRowClasses({ index: 0, clickable: false, selected: false })).toBe(
      'border-b border-retro-border/20 transition-colors hover:bg-retro-surface/30',
    );
    expect(dataTableRowClasses({ index: 3, clickable: true, selected: true })).toBe(
      `border-b border-retro-border/20 transition-colors ${clickableRowClasses} bg-retro-surface/15 hover:bg-retro-surface/30 bg-retro-surface/40`,
    );
  });

  it('brightens the glyph of the active sort direction', () => {
    expect(dataTableSortGlyphClasses('asc', false)).toBe('h-2 w-2 text-retro-muted/50');
    expect(dataTableSortGlyphClasses('asc', 'asc')).toBe('h-2 w-2 text-retro-muted/50 text-retro-text');
    expect(dataTableSortGlyphClasses('desc', 'asc')).toBe('h-2 w-2 text-retro-muted/50 -mt-0.5');
    expect(dataTableSortGlyphClasses('desc', 'desc')).toBe('h-2 w-2 text-retro-muted/50 -mt-0.5 text-retro-text');
  });
});
