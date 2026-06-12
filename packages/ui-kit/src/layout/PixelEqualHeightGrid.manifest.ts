import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelEqualHeightGrid } from './PixelEqualHeightGrid';
import { Default, RowAlignTop, PixelSurface } from './PixelEqualHeightGrid.examples';

export default defineManifest({
  name: 'PixelEqualHeightGrid',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Grid wrapper that forces equal-height children via a 3-row subgrid (header / body / footer).',
  highlights: [
    'Inherits PixelGrid props (cols, gap, surface, etc.) minus align (forced to stretch)',
    'Clones children with grid-rows-[auto_1fr_auto] so footers align across the row',
    'Surface-aware via useEffectiveSurface for consistent borders and transitions',
    'rowAlign="top" opts out of stretching while keeping equal-height children',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'row-align-top', label: 'Row Align Top', Component: RowAlignTop },
    { id: 'pixel-surface', label: 'Pixel Surface', Component: PixelSurface },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [],
    keyboard: [],
    notes:
      'Inherits semantics from the underlying PixelGrid element (defaults to <div>). Use the `as` prop to render a more semantic container when appropriate.',
  },
  // Layout primitive — the "Grid" in the name is CSS subgrid, not the ARIA grid widget.
  interactive: false,
  related: ['PixelGrid'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
