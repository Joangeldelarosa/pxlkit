import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import { PixelStatCard } from './PixelStatCard'
import {
  Default,
  Tones,
  Sizes,
  Surfaces,
  IconPositions,
  WithoutTrend,
} from './PixelStatCard.examples'

export default defineManifest({
  name: 'PixelStatCard',
  category: 'cards',
  since: '1.0.0',
  status: 'stable',
  description:
    'Compact metric card surfacing a label, value, optional icon and trend line for dashboards and KPI grids.',
  highlights: [
    'Seven tone presets aligned with the pxlkit palette (green, cyan, gold, red, purple, pink, neutral).',
    'Three sizes (sm/md/lg) that scale padding, value, label and trend typography in lockstep.',
    'Icon position aware: top, left, right or bottom-left layouts without prop drilling.',
    'Surface-aware (pixel vs linear) — inherits the ambient surface context or override per-card.',
    'Pure presentational + SSR-safe — no client hooks, fully tree-shakable.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'sizes', label: 'Sizes', Component: Sizes },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'icon-positions', label: 'Icon positions', Component: IconPositions },
    { id: 'without-trend', label: 'Without trend', Component: WithoutTrend },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['none'],
    notes:
      'Presentational card with no interactive affordances; relies on surrounding heading hierarchy and tone contrast tokens for legibility.',
  },
  related: ['PixelCard', 'PixelStatGroup', 'PixelSparkline'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
