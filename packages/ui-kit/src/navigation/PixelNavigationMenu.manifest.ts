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
    'Full keyboard support (Arrow/Home/End/Escape/Enter)',
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
    patterns: ['menubar', 'menu'],
    keyboard: [
      { key: 'ArrowRight', does: 'Focus next item', when: 'horizontal' },
      { key: 'ArrowLeft', does: 'Focus previous item', when: 'horizontal' },
      { key: 'ArrowDown', does: 'Focus next item', when: 'vertical' },
      { key: 'ArrowUp', does: 'Focus previous item', when: 'vertical' },
      { key: 'Home', does: 'Focus first item' },
      { key: 'End', does: 'Focus last item' },
      { key: 'Enter', does: 'Toggle submenu or invoke onSelect' },
      { key: 'Escape', does: 'Close any open submenu' },
    ],
    notes:
      'Provide a unique ariaLabel when more than one nav landmark exists on the page (WCAG 2.4.6). The root is a nav landmark; submenus render role=menu and mega-panels are labelled by their trigger.',
  },
  related: [],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
})
