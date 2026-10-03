import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import {
  TABLE_EMPTY_LABEL,
  TABLE_LOADING_LABEL,
  TABLE_SELECT_ALL_LABEL,
  TABLE_SELECT_LABEL,
  TABLE_SKELETON_ROWS,
  TABLE_SORT_GLYPHS,
  nextTableSort,
  sortTableRows,
  tableAriaSort,
  tableCellClasses,
  tableCheckboxClasses,
  tableClasses,
  tableColumnWidth,
  tableHeadCellClasses,
  tableRowActivationKey,
  tableRowClasses,
  tableRowId,
  tableRowSelectLabel,
  tableSelectionSummary,
  tableSortGlyphClasses,
  tableSortLabel,
  toggleTableRow,
  type PixelTableAlign,
  type PixelTableDensity,
  type PixelTableSelection,
  type PixelTableSortState,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** Context of a cell template: the row (`let-row`) and its `index`. */
export interface PixelTableCellContext<Row> {
  $implicit: Row;
  index: number;
}

/** A column of a `<pxl-table>`. */
export interface PixelTableColumn<Row = Record<string, unknown>> {
  /** Stable column id; also the lookup key into a row when `render` is absent. */
  key: string;
  /** Header cell content: text or a template. */
  header: PxlContent;
  /** Extra classes on the column's header and body cells. */
  className?: string;
  /** The header becomes a sort button and the header cell gets `aria-sort`. */
  sortable?: boolean;
  /** Text alignment of the column's cells. */
  align?: PixelTableAlign;
  /** Width in pixels, or any CSS length. */
  width?: number | string;
  /** Cell content in place of `row[key]`: text, or a template given the row and its index. */
  render?: (row: Row, index: number) => PxlContent<PixelTableCellContext<Row>>;
}

/** A clicked row, with its index in display order. */
export interface PixelTableRowClick<Row> {
  row: Row;
  index: number;
}

/**
 * A native table: striped rows, sortable headers (`aria-sort`), single or
 * multiple row selection through a checkbox column, sticky header and first
 * column, skeleton rows while loading and an empty state. Bind the sort with
 * `[(sort)]` and the selection with `[(selectedIds)]`, or leave them to the
 * table. The host is the table's scroll container.
 *
 * @example
 * <pxl-table [columns]="columns" [data]="rows" selection="multi" [(selectedIds)]="selected" />
 */
@Component({
  selector: 'pxl-table',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-table { display: block; } }',
  host: {
    '[class]': 'classes().wrapper',
  },
  template: `
    <table [class]="classes().table">
      <thead [class]="classes().head">
        <tr [class]="classes().headRow">
          @if (selection()) {
            <th scope="col" [class]="classes().selectHead">
              @if (selection() === 'multi') {
                <input
                  type="checkbox"
                  [attr.aria-label]="selectAllLabel"
                  [checked]="summary().all"
                  [indeterminate]="summary().some"
                  [class]="checkboxClasses"
                  (change)="toggleAll()"
                />
              } @else {
                <span class="sr-only">{{ selectLabel }}</span>
              }
            </th>
          }
          @for (head of headers(); track head.column.key) {
            <th scope="col" [attr.aria-sort]="head.ariaSort ?? null" [style.width]="head.width" [class]="head.classes">
              @if (head.column.sortable) {
                <button type="button" [attr.aria-label]="head.sortLabel" [class]="classes().sortButton" (click)="sortBy(head.column)">
                  <span><ng-container *pxlOutlet="head.column.header; let text">{{ text }}</ng-container></span>
                  <span aria-hidden="true" class="inline-flex flex-col leading-none ml-1">
                    @for (glyph of head.glyphs; track glyph.dir) {
                      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" [class]="glyph.classes">
                        @for (rect of glyph.rects; track $index) {
                          <rect [attr.x]="rect[0]" [attr.y]="rect[1]" [attr.width]="rect[2]" [attr.height]="rect[3]" />
                        }
                      </svg>
                    }
                  </span>
                </button>
              } @else {
                <ng-container *pxlOutlet="head.column.header; let text">{{ text }}</ng-container>
              }
            </th>
          }
        </tr>
      </thead>
      <tbody [attr.aria-busy]="loading() || null">
        @if (loading()) {
          <tr class="sr-only">
            <td [attr.colspan]="columnCount()">
              <span role="status" aria-live="polite">{{ loadingLabel }}</span>
            </td>
          </tr>
          @for (skeleton of skeletonRows; track skeleton) {
            <tr [class]="classes().skeletonRow">
              @for (cell of skeletonCells(); track cell) {
                <td [class]="classes().skeletonCell">
                  <div data-skeleton="true" aria-hidden="true" [class]="classes().skeleton"></div>
                </td>
              }
            </tr>
          }
        } @else if (bodyRows().length === 0) {
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
          @for (body of bodyRows(); track body.id) {
            <tr
              [attr.data-row-id]="body.id"
              [attr.data-selected]="body.selected || null"
              [class]="body.classes"
              [attr.tabindex]="clickableRows() ? 0 : null"
              (click)="clickRow(body.row, body.index)"
              (keydown)="activateRow($event, body.row, body.index)"
            >
              @if (selection()) {
                <td [class]="classes().selectCell" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    [attr.aria-label]="body.label"
                    [checked]="body.selected"
                    [class]="checkboxClasses"
                    (change)="toggleRow(body.id)"
                  />
                </td>
              }
              @for (cell of cells(); track cell.column.key) {
                <td [style.width]="cell.width" [class]="cell.classes">
                  @if (cell.column.render) {
                    <ng-container
                      *pxlOutlet="cell.column.render(body.row, body.index); context: { $implicit: body.row, index: body.index }; let text"
                    >{{ text }}</ng-container>
                  } @else {
                    {{ cellValue(body.row, cell.column) }}
                  }
                </td>
              }
            </tr>
          }
        }
      </tbody>
    </table>
  `,
})
export class PixelTable<Row = Record<string, unknown>> {
  /** Column definitions. */
  readonly columns = input.required<PixelTableColumn<Row>[]>();
  /** Row data. */
  readonly data = input.required<Row[]>();
  /** Tints every other row. */
  readonly striped = input(true, { transform: booleanOr(true) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Sort state (`[(sort)]`); leave unset to let the table sort. */
  readonly sort = model<PixelTableSortState | undefined>(undefined);
  /** Adds a leading checkbox column, for one row or several. */
  readonly selection = input<PixelTableSelection>();
  /** Ids of the selected rows (`[(selectedIds)]`); leave unset to let the table keep them. */
  readonly selectedIds = model<string[] | undefined>(undefined);
  /** A stable id per row; falls back to `row.id`, then to the index. */
  readonly getRowId = input<(row: Row, index: number) => string>();
  /** Sticks the header row to the top of the scroll container. */
  readonly stickyHeader = input(false, { transform: booleanOr(false) });
  /** Sticks the first column to the left of the scroll container. */
  readonly stickyFirstColumn = input(false, { transform: booleanOr(false) });
  /** Shows skeleton rows instead of the data. */
  readonly loading = input(false, { transform: booleanOr(false) });
  /** Shown in a full-width cell when `data` is empty: text or a template; "No data." by default. */
  readonly emptyState = input<PxlContent>();
  /** Makes the rows clickable: they show a pointer, take focus, and emit `(rowClick)` on a click, Enter or Space. */
  readonly clickableRows = input(false, { transform: booleanOr(false) });
  /** Cell padding scale. */
  readonly density = input<PixelTableDensity, PixelTableDensity | undefined>('normal', {
    transform: withDefault<PixelTableDensity>('normal'),
  });
  /** Surface border and radius around the table. */
  readonly bordered = input(true, { transform: booleanOr(true) });
  /** A clickable row was clicked, or activated with Enter or Space. */
  readonly rowClick = output<PixelTableRowClick<Row>>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly options = computed(() => ({
    density: this.density(),
    bordered: this.bordered(),
    stickyHeader: this.stickyHeader(),
    stickyFirstColumn: this.stickyFirstColumn(),
    selectable: this.selection() !== undefined,
  }));
  private readonly rows = computed(() => sortTableRows(this.data(), this.columns(), this.sort()));
  private readonly rowIds = computed(() => this.rows().map((row, index) => tableRowId(row, index, this.getRowId())));
  private readonly selected = computed(() => new Set(this.selectedIds() ?? []));

  /** @internal */
  protected readonly selectAllLabel = TABLE_SELECT_ALL_LABEL;
  /** @internal */
  protected readonly selectLabel = TABLE_SELECT_LABEL;
  /** @internal */
  protected readonly loadingLabel = TABLE_LOADING_LABEL;
  /** @internal */
  protected readonly emptyLabel = TABLE_EMPTY_LABEL;
  /** @internal */
  protected readonly checkboxClasses = tableCheckboxClasses;
  /** @internal */
  protected readonly skeletonRows = Array.from({ length: TABLE_SKELETON_ROWS }, (_, index) => index);
  /** @internal */
  protected readonly classes = computed(() => tableClasses(this.effectiveSurface(), this.options()));
  /** @internal */
  protected readonly columnCount = computed(() => this.columns().length + (this.options().selectable ? 1 : 0));
  /** @internal */
  protected readonly skeletonCells = computed(() => Array.from({ length: this.columnCount() }, (_, index) => index));
  /** @internal */
  protected readonly summary = computed(() => tableSelectionSummary(this.rowIds(), this.selected()));
  /** @internal */
  protected readonly headers = computed(() => {
    const sort = this.sort();
    return this.columns().map((column, index) => {
      const active = sort?.key === column.key ? sort.dir : null;
      return {
        column,
        ariaSort: tableAriaSort(column, sort),
        width: tableColumnWidth(column.width),
        classes: tableHeadCellClasses(column, index, this.options()),
        sortLabel: tableSortLabel(column.header, column.key),
        glyphs: (['asc', 'desc'] as const).map((dir) => ({
          dir,
          rects: TABLE_SORT_GLYPHS[dir],
          classes: tableSortGlyphClasses(dir, active),
        })),
      };
    });
  });
  /** @internal */
  protected readonly cells = computed(() =>
    this.columns().map((column, index) => ({
      column,
      width: tableColumnWidth(column.width),
      classes: tableCellClasses(column, index, this.options()),
    })),
  );
  /** @internal */
  protected readonly bodyRows = computed(() => {
    const selectable = this.options().selectable;
    return this.rows().map((row, index) => {
      const id = this.rowIds()[index]!;
      const selected = selectable && this.selected().has(id);
      return {
        row,
        index,
        id,
        selected,
        label: tableRowSelectLabel(id),
        classes: tableRowClasses({ index, striped: this.striped(), clickable: this.clickableRows(), selected }),
      };
    });
  });

  /** @internal */
  protected cellValue(row: Row, column: PixelTableColumn<Row>): unknown {
    return (row as Record<string, unknown>)?.[column.key] ?? '';
  }

  /** @internal */
  protected sortBy(column: PixelTableColumn<Row>): void {
    if (column.sortable) this.sort.set(nextTableSort(this.sort(), column.key));
  }

  /** @internal */
  protected toggleAll(): void {
    if (this.selection() === 'multi') this.selectedIds.set(this.summary().all ? [] : this.rowIds());
  }

  /** @internal */
  protected toggleRow(id: string): void {
    const selection = this.selection();
    if (selection) this.selectedIds.set(toggleTableRow(selection, this.selected(), id));
  }

  /** @internal */
  protected clickRow(row: Row, index: number): void {
    if (this.clickableRows()) this.rowClick.emit({ row, index });
  }

  /**
   * @internal A clickable row is reachable and activates from the keyboard
   * too; the keys of a control inside it stay the control's.
   */
  protected activateRow(event: KeyboardEvent, row: Row, index: number): void {
    if (event.target !== event.currentTarget || !tableRowActivationKey(event.key) || !this.clickableRows()) return;
    event.preventDefault();
    this.rowClick.emit({ row, index });
  }
}
