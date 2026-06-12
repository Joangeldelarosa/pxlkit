import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelGrid } from './PixelGrid';
import {
  Default,
  Responsive,
  AutoFit,
  AsymmetricGaps,
} from './PixelGrid.examples';

export default defineManifest({
  name: 'PixelGrid',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Surface-aware CSS grid container with responsive column maps, asymmetric gaps, and auto-fit/auto-fill modes.',
  highlights: [
    'Numeric or responsive column spec (base/sm/md/lg/xl)',
    'Asymmetric colGap/rowGap via stack-gap tokens',
    'autoFit / autoFill with configurable minColWidth',
    'Polymorphic via `as`; inherits semantics from rendered element',
    'Surface-aware transition classes via useEffectiveSurface',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'responsive', label: 'Responsive Columns', Component: Responsive },
    { id: 'auto-fit', label: 'Auto Fit', Component: AutoFit },
    { id: 'asymmetric-gaps', label: 'Asymmetric Gaps', Component: AsymmetricGaps },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [],
    keyboard: [],
    notes:
      'Renders as <div> by default; inherits semantics from the element provided via `as` (e.g. ul, section). Authors are responsible for the semantic role of grid children.',
  },
  // Layout primitive — the "Grid" in the name is CSS grid, not the ARIA grid widget.
  interactive: false,
  related: ['PixelStack', 'PixelCluster', 'PixelBento', 'PixelEqualHeightGrid'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
