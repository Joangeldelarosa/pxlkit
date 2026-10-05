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
    'WAI-ARIA menubar keyboard model: arrows, Home/End, Enter/Space, Escape and Tab',
    'Shortcut labels and disabled / separator items',
    'Surface-aware (border, radius, font)',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-submenus', label: 'With Submenus', Component: WithSubmenus },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['menubar', 'menu', 'menuitem'],
    keyboard: [
      { key: 'Enter / Space', does: 'Open its menu with focus in it, highlighting the first enabled item.', when: 'menu button focused' },
      { key: 'ArrowDown', does: 'Open its menu with focus in it, highlighting the first enabled item.', when: 'menu button focused' },
      { key: 'ArrowUp', does: 'Open its menu with focus in it, highlighting the last enabled item.', when: 'menu button focused' },
      { key: 'ArrowRight / ArrowLeft', does: 'Open the next / previous menu, wrapping round, with focus in it.', when: 'menu button focused' },
      { key: 'ArrowDown / ArrowUp', does: 'Highlight the next / previous enabled item, wrapping round — in the submenu when the highlight is in one.', when: 'menu open' },
      { key: 'Home / End', does: 'Highlight the first / last enabled item — of the submenu when the highlight is in one.', when: 'menu open' },
      { key: 'ArrowRight', does: 'Open the submenu, highlighting its first enabled item.', when: 'item with a submenu highlighted' },
      { key: 'ArrowLeft', does: 'Close the submenu; the highlight returns to its item.', when: 'submenu open' },
      { key: 'ArrowRight / ArrowLeft', does: 'Close the menu and open the next / previous one, wrapping round.', when: 'menu open' },
      { key: 'Enter / Space', does: 'Choose the highlighted item, close the menu and return focus to its button — or open the highlighted item’s submenu on its first item.', when: 'menu open' },
      { key: 'Escape', does: 'Close the submenu; the highlight returns to its item.', when: 'submenu open' },
      { key: 'Escape', does: 'Close the menu and return focus to its button.', when: 'menu open' },
      { key: 'Tab / Shift+Tab', does: 'Close the menu and move focus on from its button, out of the menubar.', when: 'menu open' },
    ],
    notes:
      'The menubar is one tab stop: the menu button that last had focus or a menu open. Menu buttons are `role="menuitem"` with `aria-haspopup="menu"`, `aria-expanded` and `aria-controls` wired to the open menu, which is `role="menu"` labelled by its button. The open menu takes focus (`tabindex="-1"`) and points `aria-activedescendant` at the highlighted item — in the menu or its submenu — so assistive technology follows the arrows and Home/End. Separators (`role="separator"`) and disabled items (`aria-disabled`) are skipped; items with a submenu carry `aria-haspopup` and `aria-expanded`, and the submenu is named after its item. Choosing an item, Escape and Tab return focus to the menu button; a press outside closes every menu and leaves focus where the pointer put it.',
  },
  related: ['PixelDropdown', 'PixelTabs', 'PixelBreadcrumbs'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
