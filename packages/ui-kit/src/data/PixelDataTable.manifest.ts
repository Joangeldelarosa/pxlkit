import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import {
  Default,
  PixelSurface,
  LinearSurface,
  Sortable,
  RowSelection,
  Pagination,
  CompactDensity,
  ComfortableDensity,
  Loading,
  Empty,
  StickyHeader,
  ClickableRows,
} from './PixelDataTable.examples';

export default defineManifest({
  name: 'PixelDataTable',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'TanStack-powered surface-aware data table with controlled sorting, filtering, pagination, row selection, column visibility, density, sticky header, loading skeletons and empty state.',
  highlights: [
    'Fully controlled state for sorting, filtering, pagination, row selection and column visibility',
    'Built on TanStack Table with re-exported ColumnDef and createColumnHelper for typed columns',
    'Auto-injected selection column with indeterminate header checkbox when row selection is enabled',
    'Three density presets, sticky header, skeleton loading rows and configurable empty state',
    'Surface-aware (pixel or linear) with focus-ring tokens and retro design system colors',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'pixel-surface', label: 'Pixel surface', Component: PixelSurface },
    { id: 'linear-surface', label: 'Linear surface', Component: LinearSurface },
    { id: 'sortable', label: 'Sortable columns', Component: Sortable },
    { id: 'row-selection', label: 'Row selection', Component: RowSelection },
    { id: 'pagination', label: 'Pagination', Component: Pagination },
    { id: 'compact-density', label: 'Compact density', Component: CompactDensity },
    { id: 'comfortable-density', label: 'Comfortable density', Component: ComfortableDensity },
    { id: 'loading', label: 'Loading', Component: Loading },
    { id: 'empty', label: 'Empty state', Component: Empty },
    { id: 'sticky-header', label: 'Sticky header', Component: StickyHeader },
    { id: 'clickable-rows', label: 'Clickable rows', Component: ClickableRows },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['table'],
    keyboard: [
      { key: 'Enter', does: 'Activates a sortable column header button to cycle sort direction' },
      { key: 'Space', does: 'Toggles the selection checkbox when focused in the selection column' },
      { key: 'Tab', does: 'Moves focus between sort buttons, selection checkboxes and pagination controls' },
    ],
    notes:
      'Renders semantic <table>, <thead>, <tbody>, <th scope="col"> and aria-sort on sortable column headers. Row selection checkboxes carry aria-label "Select row {id}" and a header checkbox labelled "Select all rows" with indeterminate state. Loading body exposes aria-busy and a role="status" with aria-live="polite" announcement. Pagination buttons declare aria-label and the page counter is announced with aria-live.',
  },
  related: ['PixelTable', 'PixelPagination', 'PixelEmptyState'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
