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
    'SSR-safe portal primitive: renders children inline on the server and while hydrating, then portals them into document.body or a container. Content mounted later on the client is portaled from its first render.',
  highlights: [
    'SSR-safe: renders inline on the server and during hydration to avoid hydration mismatches',
    'Content mounted after hydration is portaled from its first render, so focus set inside it stays put',
    'Targets document.body by default; the container prop picks another element',
    'Can be disabled to keep children inline (useful for testing or conditional portaling)',
    'Preserves React tree context so focus, events, and providers flow normally',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'disabled', label: 'Disabled (inline)', Component: Disabled },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['SSR-safe portal', 'focus order preserved via React tree'],
    keyboard: [],
    notes:
      'Portal content remains in the React tree, so focus order, events, and context providers behave as if the children were rendered in place.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
