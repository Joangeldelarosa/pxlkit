import * as React from 'react';
import { PixelTable, type PixelTableSortState } from './PixelTable';

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
];

const baseColumns = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
];

export function Default() {
  return <PixelTable<Row> columns={baseColumns} data={rows} />;
}

export function Striped() {
  return <PixelTable<Row> columns={baseColumns} data={rows} striped />;
}

export function PixelSurface() {
  return <PixelTable<Row> columns={baseColumns} data={rows} surface="pixel" />;
}

export function LinearSurface() {
  return <PixelTable<Row> columns={baseColumns} data={rows} surface="linear" />;
}

export function Sortable() {
  const [sort, setSort] = React.useState<PixelTableSortState>({ key: 'name', dir: 'asc' });
  const sortable = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'status', header: 'Status' },
  ];
  return (
    <PixelTable<Row>
      columns={sortable}
      data={rows}
      sort={sort}
      onSortChange={setSort}
    />
  );
}

export function SingleSelection() {
  const [selected, setSelected] = React.useState<string[]>(['1']);
  return (
    <PixelTable<Row>
      columns={baseColumns}
      data={rows}
      selection="single"
      selectedIds={selected}
      onSelectionChange={setSelected}
    />
  );
}

export function MultiSelection() {
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <PixelTable<Row>
      columns={baseColumns}
      data={rows}
      selection="multi"
      selectedIds={selected}
      onSelectionChange={setSelected}
    />
  );
}

export function CompactDensity() {
  return <PixelTable<Row> columns={baseColumns} data={rows} density="compact" />;
}

export function ComfortableDensity() {
  return <PixelTable<Row> columns={baseColumns} data={rows} density="comfortable" />;
}

export function Loading() {
  return <PixelTable<Row> columns={baseColumns} data={[]} loading />;
}

export function Empty() {
  return (
    <PixelTable<Row>
      columns={baseColumns}
      data={[]}
      emptyState={<span>No records found.</span>}
    />
  );
}

export function StickyHeader() {
  return <PixelTable<Row> columns={baseColumns} data={rows} stickyHeader />;
}

export function CustomRender() {
  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'status',
      header: 'Status',
      render: (row: Row) => (
        <span style={{ textTransform: 'uppercase' }}>{row.status}</span>
      ),
    },
  ];
  return <PixelTable<Row> columns={columns} data={rows} />;
}

export function ClickableRows() {
  const [last, setLast] = React.useState<string>('');
  return (
    <div>
      <PixelTable<Row>
        columns={baseColumns}
        data={rows}
        onRowClick={(row) => setLast(row.name)}
      />
      <p>Last clicked: {last || 'none'}</p>
    </div>
  );
}
