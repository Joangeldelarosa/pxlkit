import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSidebar } from './PixelSidebar';
import { Default, Collapsible, Nested, WithFooter } from './PixelSidebar.examples';

export default defineManifest({
  name: 'PixelSidebar',
  category: 'navigation',
  since: '1.9.0',
  status: 'stable',
  description: 'Vertical navigation rail with sections, nested items, badges, and an optional collapsible width.',
  highlights: [
    'Sections with optional titles and nested items up to two levels deep',
    'Controlled and uncontrolled collapse with width swap and toggle button',
    'Tone-aware badges per item and surface-coherent borders/typography',
    'aside-style nav landmark with aria-current and aria-expanded toggle',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'collapsible', label: 'Collapsible', Component: Collapsible },
    { id: 'nested', label: 'Nested items', Component: Nested },
    { id: 'with-footer', label: 'With footer', Component: WithFooter },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['nav landmark', 'aria-current', 'aria-expanded toggle', 'badge aria-label'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus through items and the collapse toggle' },
      { key: 'Enter / Space', does: 'Activates the focused item or toggle' },
    ],
    notes: 'Collapse toggle uses aria-expanded; collapsed items expose their label via aria-label and title.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
