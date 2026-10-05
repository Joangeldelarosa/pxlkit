import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import { PixelPortal } from './PixelPortal'
import { Default, Disabled } from './PixelPortal.examples'

void PixelPortal

export default defineManifest({
  name: 'PixelPortal',
  category: 'overlay-foundation',
  since: '1.8.0',
  status: 'stable',
  description:
    'SSR-safe portal primitive: renders children inline on the server and while hydrating, then portals them into document.body or a container, keeping the focus set inside them.',
  highlights: [
    'SSR-safe: renders inline on the server and during hydration to avoid hydration mismatches',
    'Focus set inside the content stays put as the content reaches its target',
    'Targets document.body by default; the container prop picks another element',
    'Can be disabled to keep its content inline (useful for testing or conditional portaling)',
    'The content keeps its place in the component tree, so providers still reach it (in React, its events also bubble through that tree)',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'disabled', label: 'Disabled (inline)', Component: Disabled },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['SSR-safe portal', 'context preserved through the component tree'],
    keyboard: [],
    notes:
      'Portal content keeps its place in the component tree, so providers reach it as if it were rendered in place; in React, its events also bubble through that tree. Keyboard focus follows the document order, where the content sits in its target.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
