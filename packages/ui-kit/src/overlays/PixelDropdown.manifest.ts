import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelDropdown } from './PixelDropdown';
import {
  Default,
  Tones,
  Surfaces,
  Disabled,
  WithIconsAndShortcuts,
  HeadersAndSeparators,
  CheckboxAndRadio,
  DisabledItems,
  Composition,
  ControlledOpen,
} from './PixelDropdown.examples';

void PixelDropdown;

export default defineManifest({
  name: 'PixelDropdown',
  category: 'overlays',
  since: '1.0.0',
  status: 'stable',
  description:
    'Button-triggered menu of actions with keyboard navigation, typeahead, and a compositional API for advanced layouts.',
  highlights: [
    'Dual API: declarative `items[]` sugar and compositional `Root/Trigger/Content/Item` parts.',
    'Item kinds: item, separator, header, checkbox, radio, submenu (chevron affordance).',
    'Full keyboard support: arrow navigation, Home/End, Enter/Space activation, printable-key typeahead.',
    'Tones + destructive styling, optional shortcut kbd badges, and disabled rows skipped by focus.',
    'Pixel and linear surfaces honored across trigger, menu, separators, and shortcut chips.',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled trigger', Component: Disabled },
    { id: 'with-icons-and-shortcuts', label: 'Shortcuts', Component: WithIconsAndShortcuts },
    { id: 'headers-and-separators', label: 'Headers + separators', Component: HeadersAndSeparators },
    { id: 'checkbox-and-radio', label: 'Checkbox + radio items', Component: CheckboxAndRadio },
    { id: 'disabled-items', label: 'Disabled items', Component: DisabledItems },
    { id: 'composition', label: 'Compositional API', Component: Composition },
    { id: 'controlled-open', label: 'Controlled open', Component: ControlledOpen },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['menu', 'button'],
    keyboard: [
      { key: 'ArrowDown', does: 'Open the menu (if closed) and move highlight to the next enabled item.' },
      { key: 'ArrowUp', does: 'Open the menu (if closed) and move highlight to the previous enabled item.' },
      { key: 'Home', does: 'Highlight the first enabled item.', when: 'menu open' },
      { key: 'End', does: 'Highlight the last enabled item.', when: 'menu open' },
      { key: 'Enter', does: 'Activate the highlighted item and close the menu.', when: 'menu open' },
      { key: 'Space', does: 'Activate the highlighted item and close the menu.', when: 'menu open' },
      { key: 'Escape', does: 'Close the menu and clear the highlight.', when: 'menu open' },
      { key: 'a-z / 0-9', does: 'Typeahead — jump to the first item whose label starts with the typed prefix.', when: 'menu open' },
    ],
    notes:
      'Trigger exposes `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` wired to the menu id. Items use `role="menuitem"` with `aria-disabled` for skipped rows. Separators use `role="separator"`; headers are `role="presentation"`. Click-outside and Escape both dismiss.',
  },
  related: ['PixelSelect', 'PixelMenubar', 'PixelNavigationMenu', 'PixelTooltip'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
