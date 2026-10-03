import { Component, signal } from '@angular/core';
import { PixelDataTable, createColumnHelper, type ColumnDef } from '@pxlkit/ui-kit-angular';

interface Row {
  id: string;
  name: string;
  role: string;
  status: string;
}

const ROWS: Row[] = [
  { id: '1', name: 'Alice', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob', role: 'Designer', status: 'idle' },
  { id: '3', name: 'Carol', role: 'PM', status: 'active' },
  { id: '4', name: 'Dan', role: 'Engineer', status: 'active' },
  { id: '5', name: 'Eve', role: 'Designer', status: 'idle' },
];

const ch = createColumnHelper<Row>();

const COLUMNS: ColumnDef<Row, unknown>[] = [
  ch.accessor('name', { header: 'Name' }) as ColumnDef<Row, unknown>,
  ch.accessor('role', { header: 'Role' }) as ColumnDef<Row, unknown>,
  ch.accessor('status', { header: 'Status' }) as ColumnDef<Row, unknown>,
];

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" />`,
})
export class Default {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" surface="pixel" />`,
})
export class PixelSurface {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" surface="linear" />`,
})
export class LinearSurface {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" [(sorting)]="sorting" />`,
})
export class Sortable {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
  readonly sorting = signal([{ id: 'name', desc: false }]);
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" [(rowSelection)]="selection" />`,
})
export class RowSelection {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
  readonly selection = signal<Record<string, boolean>>({});
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" [(pagination)]="pagination" />`,
})
export class Pagination {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
  readonly pagination = signal({ pageIndex: 0, pageSize: 2 });
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" density="compact" />`,
})
export class CompactDensity {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" density="comfortable" />`,
})
export class ComfortableDensity {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="[]" [columns]="columns" loading />`,
})
export class Loading {
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `
    <pxl-data-table [data]="[]" [columns]="columns" [emptyState]="empty" />
    <ng-template #empty><span>No records found.</span></ng-template>
  `,
})
export class Empty {
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `<pxl-data-table [data]="rows" [columns]="columns" stickyHeader />`,
})
export class StickyHeader {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelDataTable],
  template: `
    <div>
      <pxl-data-table [data]="rows" [columns]="columns" clickableRows (rowClick)="last.set($event.name)" />
      <p>Last clicked: {{ last() || 'none' }}</p>
    </div>
  `,
})
export class ClickableRows {
  readonly rows = ROWS;
  readonly columns = COLUMNS;
  readonly last = signal('');
}
