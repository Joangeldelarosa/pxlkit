import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import {
  PixelTable,
  type PixelTableCellContext,
  type PixelTableColumn,
  type PixelTableSortState,
} from '@pxlkit/ui-kit-angular';

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
];

const COLUMNS: PixelTableColumn<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
];

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" />`,
})
export class Default {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" striped />`,
})
export class Striped {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" surface="pixel" />`,
})
export class PixelSurface {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" surface="linear" />`,
})
export class LinearSurface {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" [(sort)]="sort" />`,
})
export class Sortable {
  readonly columns: PixelTableColumn<Row>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'status', header: 'Status' },
  ];
  readonly rows = ROWS;
  readonly sort = signal<PixelTableSortState>({ key: 'name', dir: 'asc' });
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" selection="single" [(selectedIds)]="selected" />`,
})
export class SingleSelection {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
  readonly selected = signal(['1']);
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" selection="multi" [(selectedIds)]="selected" />`,
})
export class MultiSelection {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
  readonly selected = signal<string[]>([]);
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" density="compact" />`,
})
export class CompactDensity {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" density="comfortable" />`,
})
export class ComfortableDensity {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="[]" loading />`,
})
export class Loading {
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelTable],
  template: `
    <pxl-table [columns]="columns" [data]="[]" [emptyState]="empty" />
    <ng-template #empty><span>No records found.</span></ng-template>
  `,
})
export class Empty {
  readonly columns = COLUMNS;
}

@Component({
  imports: [PixelTable],
  template: `<pxl-table [columns]="columns" [data]="rows" stickyHeader />`,
})
export class StickyHeader {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
}

@Component({
  imports: [PixelTable],
  template: `
    <pxl-table [columns]="columns()" [data]="rows" />
    <ng-template #status let-row><span style="text-transform: uppercase">{{ row.status }}</span></ng-template>
  `,
})
export class CustomRender {
  private readonly status = viewChild.required<TemplateRef<PixelTableCellContext<Row>>>('status');
  readonly rows = ROWS;
  readonly columns = computed<PixelTableColumn<Row>[]>(() => [
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status', render: () => this.status() },
  ]);
}

@Component({
  imports: [PixelTable],
  template: `
    <div>
      <pxl-table [columns]="columns" [data]="rows" clickableRows (rowClick)="last.set($event.row.name)" />
      <p>Last clicked: {{ last() || 'none' }}</p>
    </div>
  `,
})
export class ClickableRows {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
  readonly last = signal('');
}
