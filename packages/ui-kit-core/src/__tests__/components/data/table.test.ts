import { describe, expect, it } from 'vitest';
import {
  TABLE_EMPTY_LABEL,
  TABLE_LOADING_LABEL,
  TABLE_SELECT_ALL_LABEL,
  TABLE_SELECT_LABEL,
  TABLE_SKELETON_ROWS,
  TABLE_SORT_GLYPHS,
  clickableRowClasses,
  focusRing,
  nextTableSort,
  sortTableRows,
  surfaceClasses,
  tableAlignClasses,
  tableAriaSort,
  tableCellClasses,
  tableCellPaddingClasses,
  tableCheckboxClasses,
  tableClasses,
  tableColumnWidth,
  tableHeadCellClasses,
  tableRowClasses,
  tableRowActivationKey,
  tableRowId,
  tableRowSelectLabel,
  tableSelectionSummary,
  tableSkeletonClasses,
  tableSortGlyphClasses,
  tableSortLabel,
  toggleTableRow,
  type TableOptions,
} from '../../../index';

describe('table rows', () => {
  it("identifies a row by getRowId, then its own id, then its index", () => {
    expect(tableRowId({ id: 'a', name: 'x' }, 3, (row) => `row-${row.name}`)).toBe('row-x');
    expect(tableRowId({ id: 7 }, 3)).toBe('7');
    expect(tableRowId({ id: null }, 3)).toBe('3');
    expect(tableRowId('plain', 2)).toBe('2');
    expect(tableRowId(null, 1)).toBe('1');
  });

  it('sorts by a sortable column: numbers numerically, text with numeric collation, empty values first', () => {
    const columns = [
      { key: 'name', sortable: true },
      { key: 'age', sortable: true },
      { key: 'tag' },
    ];
    const rows = [
      { name: 'item 10', age: 30, tag: 'b' },
      { name: 'item 9', age: 4, tag: 'a' },
      { name: null, age: undefined, tag: 'c' },
      { name: 'Item 1', age: 25, tag: 'd' },
    ];
    const names = (sorted: typeof rows) => sorted.map((row) => row.name);
    expect(names(sortTableRows(rows, columns, { key: 'name', dir: 'asc' }))).toEqual([null, 'Item 1', 'item 9', 'item 10']);
    expect(names(sortTableRows(rows, columns, { key: 'name', dir: 'desc' }))).toEqual(['item 10', 'item 9', 'Item 1', null]);
    expect(sortTableRows(rows, columns, { key: 'age', dir: 'asc' }).map((row) => row.age)).toEqual([undefined, 4, 25, 30]);
  });

  it('keeps the order without a sort, or for a column that does not sort or does not exist', () => {
    const rows = [{ v: 2 }, { v: 1 }];
    expect(sortTableRows(rows, [{ key: 'v', sortable: true }], undefined)).toBe(rows);
    expect(sortTableRows(rows, [{ key: 'v' }], { key: 'v', dir: 'asc' })).toBe(rows);
    expect(sortTableRows(rows, [{ key: 'v', sortable: true }], { key: 'w', dir: 'asc' })).toBe(rows);
  });

  it('keeps rows with equal or both empty values in place', () => {
    const rows = [
      { id: 'a', v: null },
      { id: 'b', v: 1 },
      { id: 'c', v: null },
      { id: 'd', v: 1 },
    ];
    expect(sortTableRows(rows, [{ key: 'v', sortable: true }], { key: 'v', dir: 'asc' }).map((row) => row.id)).toEqual([
      'a',
      'c',
      'b',
      'd',
    ]);
  });
});

describe('table sorting', () => {
  it('sorts a new column ascending and flips the sorted one', () => {
    expect(nextTableSort(undefined, 'name')).toEqual({ key: 'name', dir: 'asc' });
    expect(nextTableSort({ key: 'name', dir: 'asc' }, 'name')).toEqual({ key: 'name', dir: 'desc' });
    expect(nextTableSort({ key: 'name', dir: 'desc' }, 'name')).toEqual({ key: 'name', dir: 'asc' });
    expect(nextTableSort({ key: 'age', dir: 'asc' }, 'name')).toEqual({ key: 'name', dir: 'asc' });
  });

  it('gives sortable headers an aria-sort, none while another column sorts', () => {
    const name = { key: 'name', sortable: true };
    expect(tableAriaSort(name, { key: 'name', dir: 'asc' })).toBe('ascending');
    expect(tableAriaSort(name, { key: 'name', dir: 'desc' })).toBe('descending');
    expect(tableAriaSort(name, { key: 'age', dir: 'asc' })).toBe('none');
    expect(tableAriaSort(name, undefined)).toBe('none');
    expect(tableAriaSort({ key: 'tag' }, { key: 'tag', dir: 'asc' })).toBeUndefined();
  });

  it('names sort buttons after a text header, or the column key', () => {
    expect(tableSortLabel('Name', 'name')).toBe('Sort by Name');
    expect(tableSortLabel({ type: 'b' }, 'name')).toBe('Sort by name');
  });

  it('draws the sort glyphs as pixel rects, the active one bright', () => {
    expect(TABLE_SORT_GLYPHS.asc).toHaveLength(5);
    expect(TABLE_SORT_GLYPHS.desc[4]).toEqual([3, 4, 2, 1]);
    expect(tableSortGlyphClasses('asc', 'asc')).toBe('h-2 w-2 text-retro-text');
    expect(tableSortGlyphClasses('asc', null)).toBe('h-2 w-2 text-retro-muted/50');
    expect(tableSortGlyphClasses('desc', 'desc')).toBe('h-2 w-2 -mt-0.5 text-retro-text');
    expect(tableSortGlyphClasses('desc', 'asc')).toBe('h-2 w-2 -mt-0.5 text-retro-muted/50');
  });
});

describe('table selection', () => {
  it('summarises the selection for the header checkbox', () => {
    expect(tableSelectionSummary(['a', 'b'], new Set(['a', 'b']))).toEqual({ all: true, some: false });
    expect(tableSelectionSummary(['a', 'b'], new Set(['b']))).toEqual({ all: false, some: true });
    expect(tableSelectionSummary(['a', 'b'], new Set())).toEqual({ all: false, some: false });
    expect(tableSelectionSummary([], new Set(['a']))).toEqual({ all: false, some: false });
  });

  it('toggles one row: multiple selection adds and removes, single selection replaces or clears', () => {
    expect(toggleTableRow('multi', new Set(['a']), 'b')).toEqual(['a', 'b']);
    expect(toggleTableRow('multi', new Set(['a', 'b']), 'a')).toEqual(['b']);
    expect(toggleTableRow('single', new Set(['a']), 'b')).toEqual(['b']);
    expect(toggleTableRow('single', new Set(['a']), 'a')).toEqual([]);
  });

  it('activates a clickable row with Enter and Space only', () => {
    expect(tableRowActivationKey('Enter')).toBe(true);
    expect(tableRowActivationKey(' ')).toBe(true);
    expect(tableRowActivationKey('Tab')).toBe(false);
    expect(tableRowActivationKey('a')).toBe(false);
  });

  it('labels the selection controls and the states', () => {
    expect(tableRowSelectLabel('r1')).toBe('Select row r1');
    expect([TABLE_SELECT_ALL_LABEL, TABLE_SELECT_LABEL, TABLE_LOADING_LABEL, TABLE_EMPTY_LABEL]).toEqual([
      'Select all rows',
      'Select',
      'Loading data…',
      'No data.',
    ]);
    expect(TABLE_SKELETON_ROWS).toBe(5);
  });
});

describe('table recipes', () => {
  const options: TableOptions = {
    density: 'normal',
    bordered: true,
    stickyHeader: false,
    stickyFirstColumn: false,
    selectable: false,
  };

  it('pads cells by density and aligns them', () => {
    expect(tableCellPaddingClasses).toEqual({ compact: 'px-3 py-1', normal: 'px-4 py-2.5', comfortable: 'px-4 py-4' });
    expect(tableAlignClasses).toEqual({ left: 'text-left', center: 'text-center', right: 'text-right' });
  });

  it('frames the scroll container when bordered, and rules the header by surface', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const classes = tableClasses(surface, options);
      expect(classes.wrapper).toBe(`overflow-x-auto ${s.border} ${s.radius} border-retro-border`);
      expect(classes.table).toBe(`w-full text-left text-sm ${s.font}`);
      expect(classes.headRow).toBe(
        `bg-retro-surface/60 ${surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border'}`,
      );
      expect(classes.skeleton).toBe(tableSkeletonClasses(surface));
    }
    expect(tableClasses('pixel', { ...options, bordered: false }).wrapper).toBe('overflow-x-auto');
  });

  it('sticks the header, and the selection column with stickyFirstColumn', () => {
    expect(tableClasses('pixel', options).head).toBe('');
    const sticky = tableClasses('pixel', { ...options, stickyHeader: true, stickyFirstColumn: true, density: 'compact' });
    expect(sticky.head).toBe('sticky top-0 z-10');
    expect(sticky.selectHead).toBe(
      'whitespace-nowrap text-xs font-semibold text-retro-muted w-10 px-3 py-1 sticky left-0 z-20 bg-retro-surface/80 backdrop-blur-sm',
    );
    expect(sticky.selectCell).toBe('text-retro-text w-10 px-3 py-1 sticky left-0 z-10 bg-retro-bg');
    expect(tableClasses('pixel', options).selectCell).toBe('text-retro-text w-10 px-4 py-2.5');
  });

  it('styles the controls, skeletons and empty state', () => {
    const classes = tableClasses('linear', { ...options, density: 'comfortable' });
    expect(classes.sortButton).toBe(`inline-flex items-center text-retro-muted hover:text-retro-text outline-none ${focusRing}`);
    expect(tableCheckboxClasses).toBe(`h-4 w-4 ${focusRing}`);
    expect(classes.skeletonRow).toBe('border-b border-retro-border/20');
    expect(classes.skeletonCell).toBe('px-4 py-4');
    expect(classes.emptyCell).toBe('text-center text-retro-muted px-4 py-4');
    expect(tableSkeletonClasses('pixel')).toBe('h-3 w-full motion-safe:animate-pulse bg-retro-surface/60 rounded-none');
    expect(tableSkeletonClasses('linear')).toBe('h-3 w-full motion-safe:animate-pulse bg-retro-surface/60 rounded');
  });

  it("aligns a column's cells, adds its classes, and sticks the first one when no selection column leads", () => {
    const column = { key: 'n', align: 'right' as const, className: 'col' };
    expect(tableHeadCellClasses(column, 0, options)).toBe(
      'whitespace-nowrap text-xs font-semibold text-retro-muted px-4 py-2.5 text-right col',
    );
    expect(tableCellClasses(column, 0, options)).toBe('text-retro-text px-4 py-2.5 text-right col');
    const sticky = { ...options, stickyFirstColumn: true };
    expect(tableHeadCellClasses({ key: 'n' }, 0, sticky)).toBe(
      'whitespace-nowrap text-xs font-semibold text-retro-muted px-4 py-2.5 sticky left-0 z-20 bg-retro-surface/80 backdrop-blur-sm',
    );
    expect(tableCellClasses({ key: 'n' }, 0, sticky)).toBe('text-retro-text px-4 py-2.5 sticky left-0 z-10 bg-retro-bg');
    expect(tableCellClasses({ key: 'n' }, 1, sticky)).toBe('text-retro-text px-4 py-2.5');
    expect(tableCellClasses({ key: 'n' }, 0, { ...sticky, selectable: true })).toBe('text-retro-text px-4 py-2.5');
  });

  it('tints odd rows when striped, and marks clickable and selected rows', () => {
    const base = 'border-b border-retro-border/20 transition-colors hover:bg-retro-surface/30';
    expect(tableRowClasses({ index: 0, striped: true, clickable: false, selected: false })).toBe(base);
    expect(tableRowClasses({ index: 1, striped: true, clickable: true, selected: true })).toBe(
      `${base} bg-retro-surface/15 ${clickableRowClasses} bg-retro-surface/40`,
    );
    expect(tableRowClasses({ index: 1, striped: false, clickable: false, selected: false })).toBe(base);
  });

  it('sizes a column in pixels or any CSS length', () => {
    expect(tableColumnWidth(120)).toBe('120px');
    expect(tableColumnWidth('40%')).toBe('40%');
    expect(tableColumnWidth(undefined)).toBeUndefined();
  });
});
