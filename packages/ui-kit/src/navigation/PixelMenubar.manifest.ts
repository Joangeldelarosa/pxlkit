import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { Default, WithSubmenus } from './PixelMenubar.examples';

export default defineManifest({
  name: 'PixelMenubar',
  category: 'navigation',
  since: '1.9.0',
  status: 'stable',
  description:
    'Horizontal application menubar with nested submenus, keyboard navigation, and shortcut hints.',
  highlights: [
    'Top-level menus with click + hover-to-switch behavior',
    'Nested submenus with right-arrow open / left-arrow close',
    'Full arrow-key, Home/End, Enter/Space, and Escape support',
    'Shortcut labels and disabled / separator items',
    'Surface-aware (border, radius, font) via Surface context',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-submenus', label: 'With Submenus', Component: WithSubmenus },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'role=menubar with role=menuitem triggers',
      'role=menu submenus with aria-labelledby + aria-activedescendant',
      'aria-haspopup / aria-expanded on items that open submenus',
    ],
    keyboard: [
      { key: 'ArrowRight / ArrowLeft', does: 'Move between top-level menus' },
      { key: 'ArrowDown / ArrowUp', does: 'Move focus within an open menu' },
      { key: 'Home / End', does: 'Jump to first / last enabled item' },
      { key: 'Enter / Space', does: 'Activate item or open its submenu' },
      { key: 'ArrowRight', does: 'Open submenu of the active item', when: 'menu is open' },
      { key: 'ArrowLeft', does: 'Close current submenu', when: 'submenu is open' },
      { key: 'Escape', does: 'Close any open menu' },
    ],
    notes:
      'Click-outside closes all open menus. Disabled and separator items are skipped during keyboard traversal.',
  },
  related: ['PixelDropdown', 'PixelTabs', 'PixelBreadcrumbs'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
