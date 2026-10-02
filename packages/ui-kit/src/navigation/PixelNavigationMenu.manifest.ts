import { defineManifest } from '../../../../scripts/build-docs/manifest-schema'
import { PixelNavigationMenu } from './PixelNavigationMenu'
import { Default, Vertical, InlinePanels } from './PixelNavigationMenu.examples'

void PixelNavigationMenu

export default defineManifest({
  name: 'PixelNavigationMenu',
  category: 'navigation',
  since: '1.9.0',
  status: 'stable',
  description:
    'Accessible nav landmark with optional mega-panel submenus, keyboard navigation, and surface-aware styling.',
  highlights: [
    'Horizontal or vertical orientation',
    'Optional shared viewport panel or inline per-item panels',
    'WAI-ARIA disclosure navigation: each panel follows its button in the tab order, with Arrow/Home/End/Escape keys',
    'Surface-aware via useEffectiveSurface',
    'SSR-safe, ref-forwarded nav landmark',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'vertical', label: 'Vertical', Component: Vertical },
    { id: 'inline-panels', label: 'Inline Panels', Component: InlinePanels },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['navigation', 'disclosure'],
    keyboard: [
      { key: 'Tab', does: 'Move to the next link or button; from the button of an open panel, into the panel' },
      { key: 'Shift+Tab', does: 'Move to the previous link or button' },
      { key: 'Enter', does: 'Toggle the panel of a button, or follow a link; invokes `onSelect`' },
      { key: 'Space', does: 'Toggle the panel of a button; invokes `onSelect`' },
      { key: 'ArrowRight', does: 'Focus next item, wrapping round', when: 'horizontal' },
      { key: 'ArrowLeft', does: 'Focus previous item, wrapping round', when: 'horizontal' },
      { key: 'ArrowDown', does: 'Focus the first link of the open panel', when: 'horizontal, on the button of an open panel' },
      { key: 'ArrowDown', does: 'Focus next item, wrapping round', when: 'vertical' },
      { key: 'ArrowUp', does: 'Focus previous item, wrapping round', when: 'vertical' },
      { key: 'Home', does: 'Focus first item' },
      { key: 'End', does: 'Focus last item' },
      { key: 'Escape', does: 'Close the open panel; focus on its button or inside it returns to the button' },
    ],
    notes:
      'Follows the WAI-ARIA disclosure navigation pattern, without menu roles (those are for application menus): a `<nav>` landmark — give it a unique `ariaLabel` when the page has more than one (WCAG 2.4.6) — holding a list of links, and of buttons with `aria-expanded` and `aria-controls` for the items with `content`. Each panel is a plain container rendered right after its button, inside the same list item, so Tab moves from the button into the open panel; the shared viewport is only drawn below the whole list. A click, or Enter / Space on the button, toggles the panel; focus alone never opens it. A mouse pointing at an item opens its panel — touch and pen pointers do not, so a tap opens it once — and the pointer leaving the menu closes that panel, unless a click on its button kept it open: a panel opened by a click stays open until a click on its button or another one, or Escape. A panel that closes while focus is inside it hands focus back to its button. An item with both an `href` and `content` is a button whose activation toggles the panel instead of navigating.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
