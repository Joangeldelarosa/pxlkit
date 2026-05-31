import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBox } from './PixelBox';
import { Default, Outline, Soft, AsSection } from './PixelBox.examples';

export default defineManifest({
  name: 'PixelBox',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Surface-aware polymorphic container with tone, variant, padding, radius, border, and shadow controls.',
  highlights: [
    'Surface-aware tokens via useEffectiveSurface (retro / pixel)',
    'Tone + variant matrix (solid / soft / outline / ghost)',
    'Polymorphic `as` for semantic landmarks (section, nav, aside, main, header, footer, article)',
    'Dev-time a11y warning when rendered as a landmark without an accessible name',
    'Padding and radius scale tokens with sensible defaults',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'outline', label: 'Outline', Component: Outline },
    { id: 'soft', label: 'Soft', Component: Soft },
    { id: 'as-section', label: 'As Section', Component: AsSection },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['unopinionated-polymorphic-surface'],
    keyboard: [],
    notes:
      'Inherits semantics from the `as` element. When `as` is a landmark (section, nav, aside, main), provide aria-label or aria-labelledby for an accessible name.',
  },
  related: ['PixelSection', 'PixelStack', 'PixelCluster'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
