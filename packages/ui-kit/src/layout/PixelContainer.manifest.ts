import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelContainer } from './PixelContainer';
import { Default, Narrow, AsMain, ProseWidth } from './PixelContainer.examples';

export default defineManifest({
  name: 'PixelContainer',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Surface-aware page section wrapper with token-driven max-width, page gutter, and vertical rhythm.',
  highlights: [
    'Surface-aware tokens via useEffectiveSurface (retro / pixel)',
    'Token-driven maxWidth, padding x (gutter), and padding y (section rhythm)',
    'Polymorphic `as` for semantic landmarks (section, main, header, footer, article, aside, div)',
    'Composes PixelCenter internally for consistent horizontal centering',
    'SSR-safe and forwards refs to the underlying element',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'narrow', label: 'Narrow', Component: Narrow },
    { id: 'as-main', label: 'As Main', Component: AsMain },
    { id: 'prose-width', label: 'Prose Width', Component: ProseWidth },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['semantic-section-wrapper'],
    keyboard: [],
    notes:
      'Inherits semantics from the `as` element (defaults to `section`). When rendered as a landmark, provide aria-label or aria-labelledby for an accessible name.',
  },
  related: ['PixelSection', 'PixelCenter', 'PixelBox'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
