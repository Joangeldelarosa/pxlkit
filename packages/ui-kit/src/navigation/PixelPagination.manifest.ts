import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelPagination } from '../navigation';
import {
  Default,
  ManyPages,
  MidWindow,
  MoreSiblings,
  PixelSurface,
  LinearSurface,
  LocalisedLabels,
  FirstPage,
  LastPage,
  SinglePage,
} from './PixelPagination.examples';

export default defineManifest({
  name: 'PixelPagination',
  category: 'navigation',
  since: '1.0.0',
  status: 'stable',
  description:
    'Windowed page-number navigator with Prev/Next, ellipses, and first/last anchors for navigating long paginated collections.',
  highlights: [
    'Windowed page list with ellipses to handle large totals without overflow.',
    'Configurable siblings to widen or tighten the visible window around the current page.',
    'Prev/Next buttons auto-disable at the edges (page 1 and last page).',
    'Localised prevLabel, nextLabel, and ariaLabel for i18n.',
    'Pixel and linear surfaces follow ambient surface context.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'many-pages', label: 'Many Pages', Component: ManyPages },
    { id: 'mid-window', label: 'Mid Window', Component: MidWindow },
    { id: 'more-siblings', label: 'More Siblings', Component: MoreSiblings },
    { id: 'pixel-surface', label: 'Pixel Surface', Component: PixelSurface },
    { id: 'linear-surface', label: 'Linear Surface', Component: LinearSurface },
    { id: 'localised-labels', label: 'Localised Labels', Component: LocalisedLabels },
    { id: 'first-page', label: 'First Page', Component: FirstPage },
    { id: 'last-page', label: 'Last Page', Component: LastPage },
    { id: 'single-page', label: 'Single Page', Component: SinglePage },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['navigation'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus through Prev, page buttons, and Next.' },
      { key: 'Enter', does: 'Activates the focused page or Prev/Next button.' },
      { key: 'Space', does: 'Activates the focused page or Prev/Next button.' },
    ],
    notes:
      'Rendered as a <nav> landmark with a configurable aria-label. The current page button carries aria-current="page"; ellipses are aria-hidden so screen readers skip decorative gaps. Prev/Next buttons disable at the edges instead of being removed, preserving layout and predictable tab order.',
  },
  related: ['PixelBreadcrumb', 'PixelTable', 'PixelDataTable'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
