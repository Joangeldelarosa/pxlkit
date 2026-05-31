import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSection } from './PixelSection';
import {
  Default,
  WithoutTitle,
  PixelSurface,
  NoContainer,
} from './PixelSection.examples';

export default defineManifest({
  name: 'PixelSection',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Bordered section with optional uppercase title row, subtitle, and surface-aware container.',
  highlights: [
    'Surface-aware borders and typography via useEffectiveSurface',
    'Optional title (uppercased via locale) and subtitle row',
    'Configurable container max-width or full-bleed with page gutter',
    'Vertical rhythm token controls spacing between sections',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'without-title', label: 'Without Title', Component: WithoutTitle },
    { id: 'pixel-surface', label: 'Pixel Surface', Component: PixelSurface },
    { id: 'no-container', label: 'No Container', Component: NoContainer },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['semantic-section'],
    keyboard: [],
    notes:
      'Renders as a semantic <section>. When `title` is provided it becomes the section heading; consumers may add aria-labelledby externally when needed.',
  },
  related: ['PixelCenter'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
