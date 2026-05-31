import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelScrollArea } from './PixelScrollArea';
import { Default, AlwaysVisible, CustomScrollbarSize } from './PixelScrollArea.examples';

export default defineManifest({
  name: 'PixelScrollArea',
  category: 'layout',
  since: '1.9.0',
  status: 'stable',
  description:
    'Surface-aware scroll container with styled scrollbar, configurable visibility and dimensions.',
  highlights: [
    'Surface-aware scrollbar palette (retro / pixel) via useEffectiveSurface',
    'Scrollbar visibility modes: auto, always, scroll, hover',
    '`maxHeight` caps content before scrolling kicks in',
    '`scrollbarSize` and `offsetScrollbars` (stable gutter) for layout stability',
    'Focusable region (tabIndex 0) with focus-visible ring and dev-time a11y warning',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'always-visible', label: 'Always Visible', Component: AlwaysVisible },
    { id: 'custom-scrollbar-size', label: 'Custom Scrollbar Size', Component: CustomScrollbarSize },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['scrollable-region'],
    keyboard: [
      { key: 'Tab', does: 'Moves focus into the scroll region' },
      { key: 'ArrowUp / ArrowDown', does: 'Scrolls vertically when focused' },
      { key: 'PageUp / PageDown', does: 'Scrolls by a page when focused' },
      { key: 'Home / End', does: 'Jumps to start or end of the scrollable content' },
    ],
    notes:
      'Region is focusable (tabIndex 0, role="region") so keyboard users can scroll. Provide aria-label or aria-labelledby so screen-reader users know what they have landed on; a dev-time warning fires if none is set.',
  },
  related: ['PixelBox', 'PixelStack', 'PixelSection'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
