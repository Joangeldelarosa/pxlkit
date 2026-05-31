import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelBreadcrumb } from '../navigation';
import {
  Default,
  PixelSurface,
  LinearSurface,
  WithOnClick,
  PlainLabels,
  SingleCrumb,
  LocalisedLabel,
  DeepTrail,
} from './PixelBreadcrumb.examples';

void PixelBreadcrumb;

export default defineManifest({
  name: 'PixelBreadcrumb',
  category: 'navigation',
  since: '1.0.0',
  status: 'stable',
  description:
    'Trail of links representing the user\'s location in a hierarchical site structure, with pixel-chevron or slash separators per surface.',
  highlights: [
    'Renders <nav> + <ol>/<li> landmark with configurable aria-label.',
    'Active crumb marked with aria-current="page" and emphasised typography.',
    'Per-item href (link), onClick (button), or plain label — choose per crumb.',
    'Pixel surface uses a crisp-edged chevron SVG; linear surface uses a slash separator.',
    'SSR-safe, tree-shakable, and inherits ambient surface context.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'pixel-surface', label: 'Pixel surface', Component: PixelSurface },
    { id: 'linear-surface', label: 'Linear surface', Component: LinearSurface },
    { id: 'with-onclick', label: 'With onClick', Component: WithOnClick },
    { id: 'plain-labels', label: 'Plain labels', Component: PlainLabels },
    { id: 'single-crumb', label: 'Single crumb', Component: SingleCrumb },
    { id: 'localised-label', label: 'Localised label', Component: LocalisedLabel },
    { id: 'deep-trail', label: 'Deep trail', Component: DeepTrail },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['navigation'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus through interactive crumbs (links and buttons).' },
      { key: 'Enter', does: 'Activates the focused crumb link or button.' },
      { key: 'Space', does: 'Activates the focused crumb when rendered as a button.' },
    ],
    notes:
      'Rendered as a <nav> landmark with a configurable aria-label (defaults to "Breadcrumb"). Crumbs live inside an ordered <ol>/<li> list reflecting the hierarchy. The active crumb carries aria-current="page" and is rendered as a non-interactive <span> to convey the user\'s current location. Separators between crumbs use aria-hidden so screen readers skip the decorative chevron or slash.',
  },
  related: ['PixelPagination', 'PixelTextLink'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
