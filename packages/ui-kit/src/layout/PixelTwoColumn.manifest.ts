import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelTwoColumn } from './PixelTwoColumn';
import {
  Default,
  SixtyForty,
  Reversed,
  StackedBelowLg,
  PixelSurface,
} from './PixelTwoColumn.examples';

export default defineManifest({
  name: 'PixelTwoColumn',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Two-column grid layout with preset ratios, responsive stacking, and surface-aware transitions.',
  highlights: [
    'Preset ratios (50/50, 60/40, 40/60, 70/30, 30/70) with JIT-safe class maps',
    'Responsive stacking below sm, md, or lg breakpoints',
    'Reverse order toggle to flip visual order without changing markup semantics',
    'Token-based gap scale via stackGap for consistent rhythm',
    'Surface-aware transitions through useEffectiveSurface',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'sixty-forty', label: 'Sixty Forty', Component: SixtyForty },
    { id: 'reversed', label: 'Reversed', Component: Reversed },
    { id: 'stacked-below-lg', label: 'Stacked Below Lg', Component: StackedBelowLg },
    { id: 'pixel-surface', label: 'Pixel Surface', Component: PixelSurface },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['ratio-split-container'],
    keyboard: [],
    notes:
      'Renders as <div> with semantic neutrality; relies on inner content for landmarks and headings.',
  },
  related: ['PixelGrid', 'PixelStack', 'PixelEqualHeightGrid'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
