import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
  signal,
  type OnInit,
} from '@angular/core';
import {
  FlexRenderDirective,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Table,
  type TableOptions,
  type Updater,
} from '@tanstack/angular-table';
import {
  DATA_TABLE_NEXT_PAGE_LABEL,
  DATA_TABLE_PAGE_SIZE_LABEL,
  DATA_TABLE_PREVIOUS_PAGE_LABEL,
  DATA_TABLE_SELECT_COLUMN,
  TABLE_EMPTY_LABEL,
  TABLE_LOADING_LABEL,
  TABLE_SELECT_ALL_LABEL,
  TABLE_SORT_GLYPHS,
  dataTableAriaSort,
  dataTableClasses,
  dataTableColumnFilters,
  dataTableFilterRecord,
  dataTablePageNumber,
  dataTablePageRange,
  dataTablePageSizes,
  dataTablePaginationClasses,
  dataTableRowClasses,
  dataTableSkeletonRows,
  dataTableSortGlyphClasses,
  resolveDataTableUpdater,
  tableCheckboxClasses,
  tableRowActivationKey,
  tableRowSelectLabel,
  tableSortLabel,
  type PixelDataTableDensity,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * A TanStack Table (`@tanstack/angular-table`) rendered as a native table:
 * sortable headers (`aria-sort`), filtering, pagination with a page-size
 * select, a checkbox column for row selection, column visibility, density,
 * sticky header, skeleton rows while loading and an empty state. Every state
 * binds two-way (`[(sorting)]`, `[(rowSelection)]`, …) or stays inside the
 * table; the selection column appears once `rowSelection` is bound, the
 * pagination bar once `pagination` is. Columns are TanStack `ColumnDef`s
 * (`createColumnHelper` is re-exported), their `header` and `cell` text,
 * templates or `flexRenderComponent`s. The host is the table's scroll
 * container.
 *
 * @example
 * <pxl-data-table [data]="rows" [columns]="columns" [(sorting)]="sorting" [(rowSelection)]="selection" />
 */
@Component({
  selector: 'pxl-data-table',
  imports: [FlexRenderDirective, PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-data-table { display: block; } }',
  host: {
    '[class]': 'classes().wrapper',
  },
  template: `
    <table [class]="classes().table">
      <thead [class]="classes().head">
        @for (headerGroup of table.getHeaderGroups(); track headerGroup.id) {
          <tr>
            @for (header of headerGroup.headers; track header.id) {
              <th
                scope="col"
                [attr.aria-sort]="ariaSort(header.column.getIsSorted(), header.column.getCanSort()) ?? null"
                [class]="classes().headCell"
              >
                @if (header.column.id === selectColumn) {
                  <input
                    type="checkbox"
                    [attr.aria-label]="selectAllLabel"
                    [checked]="table.getIsAllPageRowsSelected()"
                    [indeterminate]="table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()"
                    [class]="checkboxClasses"
                    (change)="table.getToggleAllPageRowsSelectedHandler()($event)"
                  />
                } @else if (!header.isPlaceholder) {
                  @if (header.column.getCanSort()) {
                    <button
                      type="button"
                      [attr.aria-label]="sortLabel(header.column.columnDef.header, header.column.id)"
                      [class]="classes().sortButton"
                      (click)="header.column.getToggleSortingHandler()?.($event)"
                    >
                      <span><ng-container *flexRender="header.column.columnDef.header; props: header.getContext(); let content">{{ content }}</ng-container></span>
                      <span aria-hidden="true" class="inline-flex flex-col leading-none">
                        @for (dir of directions; track dir) {
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 8 8"
                            [class]="glyphClasses(dir, header.column.getIsSorted())"
                            shape-rendering="crispEdges"
                            fill="currentColor"
                          >
                            @for (rect of glyphs[dir]; track $index) {
                              <rect [attr.x]="rect[0]" [attr.y]="rect[1]" [attr.width]="rect[2]" [attr.height]="rect[3]" />
                            }
                          </svg>
                        }
                      </span>
                    </button>
                  } @else {
                    <ng-container *flexRender="header.column.columnDef.header; props: header.getContext(); let content">{{ content }}</ng-container>
                  }
                }
              </th>
            }
          </tr>
        }
      </thead>
      <tbody [attr.aria-busy]="loading() || null">
        @if (loading()) {
          <tr class="sr-only">
            <td [attr.colspan]="columnCount()">
              <span role="status" aria-live="polite">{{ loadingLabel }}</span>
            </td>
          </tr>
          @for (skeleton of skeletonRows(); track skeleton) {
            <tr [class]="classes().skeletonRow">
              @for (cell of skeletonCells(); track cell) {
                <td [class]="classes().skeletonCell">
                  <div data-skeleton="true" aria-hidden="true" [class]="classes().skeleton"></div>
                </td>
              }
            </tr>
          }
        } @else if (table.getRowModel().rows.length === 0) {
          <tr>
            <td [attr.colspan]="columnCount()" [class]="classes().emptyCell">
              @if (emptyState() != null) {
                <ng-container *pxlOutlet="emptyState(); let text">{{ text }}</ng-container>
              } @else {
                <span>{{ emptyLabel }}</span>
              }
            </td>
          </tr>
        } @else {
          @for (row of table.getRowModel().rows; track row.id; let index = $index) {
            <tr
              [attr.data-row-id]="row.id"
              [attr.data-selected]="row.getIsSelected() || null"
              [class]="rowClasses(index, row.getIsSelected())"
              [attr.tabindex]="clickableRows() ? 0 : null"
              (click)="clickRow(row.original)"
              (keydown)="activateRow($event, row.original)"
            >
              @for (cell of row.getVisibleCells(); track cell.id) {
                <td [class]="classes().cell">
                  @if (cell.column.id === selectColumn) {
                    <input
                      type="checkbox"
                      [attr.aria-label]="rowLabel(row.id)"
                      [checked]="row.getIsSelected()"
                      [disabled]="!row.getCanSelect()"
                      [class]="checkboxClasses"
                      (change)="row.getToggleSelectedHandler()($event)"
                    />
                  } @else {
                    <ng-container *flexRender="cell.column.columnDef.cell; props: cell.getContext(); let content">{{ content }}</ng-container>
                  }
                </td>
              }
            </tr>
          }
        }
      </tbody>
    </table>
    @if (paginationEnabled()) {
      <div [class]="paginationClasses().bar">
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1">
            <span>{{ pageSizeLabel }}</span>
            <select [attr.aria-label]="pageSizeLabel" [class]="paginationClasses().pageSizeSelect" (change)="changePageSize($event)">
              @for (size of pageSizes(); track size) {
                <option [value]="size" [selected]="size === paginationState().pageSize">{{ size }}</option>
              }
            </select>
          </label>
          <span>Showing {{ pageRange().start }}-{{ pageRange().end }} of {{ table.getFilteredRowModel().rows.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            [disabled]="!table.getCanPreviousPage()"
            [attr.aria-label]="previousPageLabel"
            [class]="paginationClasses().pageButton"
            (click)="table.previousPage()"
          >Prev</button>
          <span aria-live="polite">Page {{ pageNumber() }} of {{ table.getPageCount() }}</span>
          <button
            type="button"
            [disabled]="!table.getCanNextPage()"
            [attr.aria-label]="nextPageLabel"
            [class]="paginationClasses().pageButton"
            (click)="table.nextPage()"
          >Next</button>
        </div>
      </div>
    }
  `,
})
export class PixelDataTable<TData, TValue = unknown> implements OnInit {
  /** Row data. */
  readonly data = input.required<TData[]>();
  /** TanStack column definitions. */
  readonly columns = input.required<ColumnDef<TData, TValue>[]>();
  /** Sort state (`[(sorting)]`); leave unset to let the table sort. */
  readonly sorting = model<{ id: string; desc: boolean }[] | undefined>(undefined);
  /**
   * Column filters, column id → value (`[(filtering)]`). Unbound, the table
   * keeps its filters as TanStack gives them, and reports nothing.
   */
  readonly filtering = model<Record<string, string> | undefined>(undefined);
  /**
   * Page (`[(pagination)]`); the pagination bar shows once it is bound, and
   * its changes — the table's own resets to the first page too — are
   * reported while it is.
   */
  readonly pagination = model<{ pageIndex: number; pageSize: number } | undefined>(undefined);
  /** Selected row ids → `true` (`[(rowSelection)]`); the selection column shows once it is bound. */
  readonly rowSelection = model<Record<string, boolean> | undefined>(undefined);
  /** Column id → shown (`[(columnVisibility)]`). */
  readonly columnVisibility = model<Record<string, boolean> | undefined>(undefined);
  /** A stable id per row; the index by default. */
  readonly getRowId = input<(row: TData, index: number) => string>();
  /** Cell padding scale. */
  readonly density = input<PixelDataTableDensity, PixelDataTableDensity | undefined>('normal', {
    transform: withDefault<PixelDataTableDensity>('normal'),
  });
  /** Sticks the header to the top of the scroll container. */
  readonly stickyHeader = input(false, { transform: booleanOr(false) });
  /** Shows skeleton rows instead of the data. */
  readonly loading = input(false, { transform: booleanOr(false) });
  /** Shown in a full-width cell when there are no rows: text or a template; "No data." by default. */
  readonly emptyState = input<PxlContent>();
  /** Makes the rows clickable: they show a pointer, take focus, and emit `(rowClick)` on a click, Enter or Space. */
  readonly clickableRows = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Surface border and radius around the table. */
  readonly bordered = input(true, { transform: booleanOr(true) });
  /** A clickable row was clicked, or activated with Enter or Space: its data. */
  readonly rowClick = output<TData>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly internalFilters = signal<ColumnFiltersState>([]);
  private readonly internalPagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });
  private readonly sortingState = computed(() => this.sorting() ?? []);
  private readonly filtersState = computed(() => {
    const filtering = this.filtering();
    return filtering ? dataTableColumnFilters(filtering) : this.internalFilters();
  });
  private readonly rowSelectionState = computed(() => this.rowSelection() ?? {});
  private readonly visibilityState = computed(() => this.columnVisibility() ?? {});
  private readonly hasRowSelection = computed(() => this.rowSelection() !== undefined);
  // Its header and cells are drawn by the template.
  private readonly selectionColumn: ColumnDef<TData, TValue> = { id: DATA_TABLE_SELECT_COLUMN, enableSorting: false };
  private readonly mergedColumns = computed(() =>
    this.hasRowSelection() ? [this.selectionColumn, ...this.columns()] : this.columns(),
  );
  private readonly coreRowModel = getCoreRowModel<TData>();
  private readonly sortedRowModel = getSortedRowModel<TData>();
  private readonly filteredRowModel = getFilteredRowModel<TData>();
  private readonly paginationRowModel = getPaginationRowModel<TData>();

  /** @internal */
  protected readonly paginationEnabled = computed(() => this.pagination() !== undefined);
  /** @internal */
  protected readonly paginationState = computed(() => this.pagination() ?? this.internalPagination());

  /**
   * @internal Created once the inputs are set: TanStack starts reading them
   * at the next microtask, which can come before a view's first binding.
   */
  protected table!: Table<TData>;

  /** @internal */
  protected readonly selectColumn = DATA_TABLE_SELECT_COLUMN;
  /** @internal */
  protected readonly selectAllLabel = TABLE_SELECT_ALL_LABEL;
  /** @internal */
  protected readonly loadingLabel = TABLE_LOADING_LABEL;
  /** @internal */
  protected readonly emptyLabel = TABLE_EMPTY_LABEL;
  /** @internal */
  protected readonly pageSizeLabel = DATA_TABLE_PAGE_SIZE_LABEL;
  /** @internal */
  protected readonly previousPageLabel = DATA_TABLE_PREVIOUS_PAGE_LABEL;
  /** @internal */
  protected readonly nextPageLabel = DATA_TABLE_NEXT_PAGE_LABEL;
  /** @internal */
  protected readonly checkboxClasses = tableCheckboxClasses;
  /** @internal */
  protected readonly directions = ['asc', 'desc'] as const;
  /** @internal */
  protected readonly glyphs = TABLE_SORT_GLYPHS;
  /** @internal */
  protected readonly ariaSort = dataTableAriaSort;
  /** @internal */
  protected readonly sortLabel = tableSortLabel;
  /** @internal */
  protected readonly glyphClasses = dataTableSortGlyphClasses;
  /** @internal */
  protected readonly rowLabel = tableRowSelectLabel;
  /** @internal */
  protected readonly classes = computed(() =>
    dataTableClasses(this.effectiveSurface(), {
      density: this.density(),
      bordered: this.bordered(),
      stickyHeader: this.stickyHeader(),
    }),
  );
  /** @internal */
  protected readonly paginationClasses = computed(() => dataTablePaginationClasses(this.effectiveSurface()));
  /** @internal */
  protected readonly columnCount = computed(() => this.mergedColumns().length);
  /** @internal */
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: dataTableSkeletonRows(this.paginationState().pageSize) }, (_, index) => index),
  );
  /** @internal */
  protected readonly skeletonCells = computed(() => Array.from({ length: this.columnCount() }, (_, index) => index));
  /** @internal */
  protected readonly pageSizes = computed(() => dataTablePageSizes(this.paginationState().pageSize));
  /** @internal */
  protected readonly pageRange = computed(() => {
    const { pageIndex, pageSize } = this.paginationState();
    return dataTablePageRange(pageIndex, pageSize, this.table.getFilteredRowModel().rows.length);
  });
  /** @internal */
  protected readonly pageNumber = computed(() =>
    dataTablePageNumber(this.paginationState().pageIndex, this.table.getPageCount()),
  );

  /** @internal */
  ngOnInit(): void {
    this.table = createAngularTable<TData>(() => this.tableOptions());
  }

  private tableOptions(): TableOptions<TData> {
    const getRowId = this.getRowId();
    return {
      data: this.data(),
      columns: this.mergedColumns(),
      state: {
        sorting: this.sortingState(),
        columnFilters: this.filtersState(),
        pagination: this.paginationEnabled() ? this.paginationState() : undefined,
        rowSelection: this.rowSelectionState(),
        columnVisibility: this.visibilityState(),
      },
      getRowId: getRowId ? (row: TData, index: number) => getRowId(row, index) : undefined,
      enableRowSelection: this.hasRowSelection(),
      onSortingChange: (updater) =>
        this.sorting.set(resolveDataTableUpdater(updater, this.sortingState()).map(({ id, desc }) => ({ id, desc }))),
      onColumnFiltersChange: (updater) => this.changeFilters(updater),
      onPaginationChange: (updater) => this.changePagination(updater),
      onRowSelectionChange: (updater) => this.rowSelection.set(resolveDataTableUpdater(updater, this.rowSelectionState())),
      onColumnVisibilityChange: (updater) =>
        this.columnVisibility.set(resolveDataTableUpdater(updater, this.visibilityState())),
      getCoreRowModel: this.coreRowModel,
      getSortedRowModel: this.sortedRowModel,
      getFilteredRowModel: this.filteredRowModel,
      getPaginationRowModel: this.paginationEnabled() ? this.paginationRowModel : undefined,
      manualPagination: false,
    };
  }

  /** @internal */
  protected rowClasses(index: number, selected: boolean): string {
    return dataTableRowClasses({ index, clickable: this.clickableRows(), selected });
  }

  /** @internal */
  protected clickRow(row: TData): void {
    if (this.clickableRows()) this.rowClick.emit(row);
  }

  /**
   * @internal A clickable row is reachable and activates from the keyboard
   * too; the keys of a control inside it stay the control's.
   */
  protected activateRow(event: KeyboardEvent, row: TData): void {
    if (event.target !== event.currentTarget || !tableRowActivationKey(event.key) || !this.clickableRows()) return;
    event.preventDefault();
    this.rowClick.emit(row);
  }

  /** @internal */
  protected changePageSize(event: Event): void {
    this.table.setPageSize(Number((event.target as HTMLSelectElement).value));
  }

  // Unbound, filters and page stay inside the table: a bound value would
  // turn the pagination bar on, and the filters into text.
  private changeFilters(updater: Updater<ColumnFiltersState>): void {
    const next = resolveDataTableUpdater(updater, this.filtersState());
    if (this.filtering() === undefined) this.internalFilters.set(next);
    else this.filtering.set(dataTableFilterRecord(next));
  }

  private changePagination(updater: Updater<PaginationState>): void {
    const next = resolveDataTableUpdater(updater, this.paginationState());
    if (this.pagination() === undefined) this.internalPagination.set(next);
    else this.pagination.set({ pageIndex: next.pageIndex, pageSize: next.pageSize });
  }
}
