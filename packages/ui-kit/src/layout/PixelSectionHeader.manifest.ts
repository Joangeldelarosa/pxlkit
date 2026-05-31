import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSectionHeader } from './PixelSectionHeader';
import {
  Default,
  Centered,
  WithActions,
  LargeHero,
} from './PixelSectionHeader.examples';

void PixelSectionHeader;

export default defineManifest({
  name: 'PixelSectionHeader',
  category: 'layout',
  since: '1.6.0',
  status: 'stable',
  description:
    'Section header with eyebrow, title, description, and actions — rhythm-aware and surface-aware.',
  highlights: [
    'Configurable heading level (h1–h4) preserves document outline',
    'Size and spacing scales (sm/md/lg, tight/normal/loose) use shared rhythm tokens',
    'Optional eyebrow is decorative (aria-hidden) with sr-only restatement in the heading',
    'Tone-aware title coloring via ToneKey',
    'Surface-aware typography via useEffectiveSurface',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'centered', label: 'Centered', Component: Centered },
    { id: 'with-actions', label: 'With Actions', Component: WithActions },
    { id: 'large-hero', label: 'Large Hero', Component: LargeHero },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'Heading hierarchy via as=h1..h6',
      'Decorative eyebrow tagged with aria-hidden and restated sr-only inside the heading',
    ],
    keyboard: [],
    notes:
      'Choose `as` to match the document outline of the page. The eyebrow is visually decorative but is preserved for screen readers via sr-only prefix on the heading.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
