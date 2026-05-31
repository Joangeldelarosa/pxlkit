import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelAccordion } from '../navigation';
import {
  Default,
  CollapsedByDefault,
  AllowMultiple,
  Surfaces,
  RichContent,
} from './PixelAccordion.examples';

void PixelAccordion;

export default defineManifest({
  name: 'PixelAccordion',
  category: 'navigation',
  since: '1.0.0',
  status: 'stable',
  description:
    'Vertical list of expandable disclosure items with wired aria-controls / aria-expanded / labelled regions.',
  highlights: [
    'Single-open by default; opt into multi-open via `allowMultiple`',
    'First item auto-expanded unless `collapsedByDefault` is set',
    'Surface-aware typography and borders (pixel vs linear)',
    'aria-expanded + aria-controls wired per header for assistive tech',
    'SSR-safe and tree-shakable; unopened panels are not rendered',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'collapsed-by-default', label: 'Collapsed by default', Component: CollapsedByDefault },
    { id: 'allow-multiple', label: 'Allow multiple', Component: AllowMultiple },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'rich-content', label: 'Rich content', Component: RichContent },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['disclosure'],
    keyboard: [
      { key: 'Enter', does: 'Toggles the focused item open or closed' },
      { key: 'Space', does: 'Toggles the focused item open or closed' },
      { key: 'Tab', does: 'Moves focus between item headers' },
    ],
    notes:
      'Each header is a native <button> with aria-expanded reflecting open state and aria-controls pointing at the panel id. Expanded panels render as role="region" with aria-labelledby pointing to the header, matching the WAI-ARIA disclosure pattern stacked into an accordion.',
  },
  related: ['PixelTabs', 'PixelCollapsible'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
