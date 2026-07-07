import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelStatGroup } from './PixelStatGroup';
import {
  Default,
  RowLayout,
  GridLayout,
  GridWithGap,
  Tones,
  Surfaces,
} from './PixelStatGroup.examples';

void PixelStatGroup;

export default defineManifest({
  name: 'PixelStatGroup',
  category: 'data',
  since: '1.9.0',
  status: 'stable',
  description:
    'Surface-aware container that groups PixelStatCard tiles in a row with dividers or a responsive grid, with shared tone and accessible group labeling.',
  highlights: [
    'Row layout with vertical dividers or grid layout with configurable columns (1–6).',
    'Tone-driven border color shared by the container and inter-cell dividers.',
    'Surface-aware: pixel chamfered border + pixel radius, or linear rounded corners.',
    'Adopts role="group" automatically when aria-label or aria-labelledby is provided.',
    'Forwards ref to the underlying div and spreads native HTMLAttributes.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'row-layout', label: 'Row layout', Component: RowLayout },
    { id: 'grid-layout', label: 'Grid layout', Component: GridLayout },
    { id: 'grid-with-gap', label: 'Grid with gap', Component: GridWithGap },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['group'],
    keyboard: [],
    notes:
      'Renders as a plain <div> by default. When aria-label or aria-labelledby is provided, the root gains role="group" to expose the collection as a named landmark to assistive tech. Without an accessible name the role is intentionally dropped to avoid an unlabeled group node. The inner stat tiles (PixelStatCard) carry their own label/value semantics.',
  },
  related: ['PixelStatCard', 'PixelBadgeGroup', 'PixelAvatarGroup'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
