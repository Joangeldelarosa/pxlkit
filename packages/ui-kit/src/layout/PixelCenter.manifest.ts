import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCenter } from './PixelCenter';
import {
  Default,
  NarrowProse,
  TextCentered,
  AsSection,
} from './PixelCenter.examples';

export default defineManifest({
  name: 'PixelCenter',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Polymorphic max-width wrapper that centers content horizontally with token-driven page gutters.',
  highlights: [
    'Token-driven max-width via the containerWidth scale',
    'Token-driven horizontal padding via the pageGutter scale',
    'Polymorphic via the `as` prop — inherits semantics from the chosen element',
    'Optional text alignment helper (left / center / right)',
    'Surface-aware transition tokens through useEffectiveSurface',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'narrow-prose', label: 'Narrow Prose', Component: NarrowProse },
    { id: 'text-centered', label: 'Text Centered', Component: TextCentered },
    { id: 'as-section', label: 'As Section', Component: AsSection },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['polymorphic-wrapper'],
    keyboard: [],
    notes:
      'Renders as <div> by default; consumers pass `as` to inherit appropriate semantics (e.g. section, main, article). No additional ARIA is required.',
  },
  related: ['PixelSection', 'PixelContainer'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
