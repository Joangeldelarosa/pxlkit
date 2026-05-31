import * as React from 'react';
import {
  PixelDataTable,
  createColumnHelper,
  type ColumnDef,
} from './PixelDataTable';

type Row = {
  id: string;
  name: string;
  role: string;
  status: string;
};

const rows: Row[] = [
  { id: '1', name: 'Alice', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob', role: 'Designer', status: 'idle' },
  { id: '3', name: 'Carol', role: 'PM', status: 'active' },
  { id: '4', name: 'Dan', role: 'Engineer', status: 'active' },
  { id: '5', name: 'Eve', role: 'Designer', status: 'idle' },
];

const ch = createColumnHelper<Row>();

const columns: ColumnDef<Row, unknown>[] = [
  ch.accessor('name', { header: 'Name' }) as ColumnDef<Row, unknown>,
  ch.accessor('role', { header: 'Role' }) as ColumnDef<Row, unknown>,
  ch.accessor('status', { header: 'Status' }) as ColumnDef<Row, unknown>,
];

export function Default() {
  return <PixelDataTable<Row> data={rows} columns={columns} />;
}

export function PixelSurface() {
  return <PixelDataTable<Row> data={rows} columns={columns} surface="pixel" />;
}

export function LinearSurface() {
  return <PixelDataTable<Row> data={rows} columns={columns} surface="linear" />;
}

export function Sortable() {
  const [sorting, setSorting] = React.useState<{ id: string; desc: boolean }[]>([
    { id: 'name', desc: false },
  ]);
  return (
    <PixelDataTable<Row>
      data={rows}
      columns={columns}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}

export function RowSelection() {
  const [selection, setSelection] = React.useState<Record<string, boolean>>({});
  return (
    <PixelDataTable<Row>
      data={rows}
      columns={columns}
      rowSelection={selection}
      onRowSelectionChange={setSelection}
    />
  );
}

export function Pagination() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 2 });
  return (
    <PixelDataTable<Row>
      data={rows}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}

export function CompactDensity() {
  return <PixelDataTable<Row> data={rows} columns={columns} density="compact" />;
}

export function ComfortableDensity() {
  return <PixelDataTable<Row> data={rows} columns={columns} density="comfortable" />;
}

export function Loading() {
  return <PixelDataTable<Row> data={[]} columns={columns} loading />;
}

export function Empty() {
  return (
    <PixelDataTable<Row>
      data={[]}
      columns={columns}
      emptyState={<span>No records found.</span>}
    />
  );
}

export function StickyHeader() {
  return <PixelDataTable<Row> data={rows} columns={columns} stickyHeader />;
}

export function ClickableRows() {
  const [last, setLast] = React.useState<string>('');
  return (
    <div>
      <PixelDataTable<Row>
        data={rows}
        columns={columns}
        onRowClick={(row) => setLast(row.name)}
      />
      <p>Last clicked: {last || 'none'}</p>
    </div>
  );
}
