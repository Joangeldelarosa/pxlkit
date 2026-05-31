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
    'SSR-safe portal primitive that renders children inline during SSR and first hydration, then swaps to a real createPortal after mount.',
  highlights: [
    'SSR-safe: renders inline on the server and on first client paint to avoid hydration mismatches',
    'Swaps to React.createPortal after mount, targeting document.body by default',
    'Accepts a custom container element via the container prop',
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
