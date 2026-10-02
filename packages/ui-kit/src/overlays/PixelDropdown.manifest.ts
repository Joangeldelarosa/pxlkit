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
      { key: 'Enter / Space', does: 'Open the menu and move focus into it.', when: 'trigger focused' },
      { key: 'ArrowDown', does: 'Open the menu with focus in it, highlighting the first enabled item.', when: 'trigger focused' },
      { key: 'ArrowUp', does: 'Open the menu with focus in it, highlighting the last enabled item.', when: 'trigger focused' },
      { key: 'ArrowDown', does: 'Highlight the next enabled item; stops at the last.', when: 'menu open' },
      { key: 'ArrowUp', does: 'Highlight the previous enabled item; stops at the first.', when: 'menu open' },
      { key: 'Home', does: 'Highlight the first enabled item.', when: 'menu open' },
      { key: 'End', does: 'Highlight the last enabled item.', when: 'menu open' },
      { key: 'Enter', does: 'Activate the highlighted item, close the menu and return focus to the trigger.', when: 'menu open' },
      { key: 'Space', does: 'Activate the highlighted item, close the menu and return focus to the trigger.', when: 'menu open' },
      { key: 'Escape', does: 'Close the menu, clear the highlight and return focus to the trigger.', when: 'menu open' },
      { key: 'Tab', does: 'Close the menu and move focus on from the trigger to the next focusable element.', when: 'menu open' },
      { key: 'Shift+Tab', does: 'Close the menu and move focus back from the trigger to the previous focusable element.', when: 'menu open' },
      { key: 'a-z / 0-9', does: 'Typeahead — jump to the first item whose label starts with the typed prefix.', when: 'menu open' },
    ],
    notes:
      'Trigger exposes `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` wired to the menu id while the menu is open, and names the menu through `aria-labelledby` (its own `id`, or a generated one). The open menu takes focus (`tabindex="-1"`) and points `aria-activedescendant` at the highlighted item, so assistive technology follows the arrows, Home/End and typeahead. Items use `role="menuitem"` — `menuitemcheckbox` and `menuitemradio` with `aria-checked` for checkbox and radio rows — with `aria-disabled` for skipped rows. Separators use `role="separator"`; headers are `role="presentation"`. Escape, choosing an item and Tab return focus to the trigger; a press outside closes the menu and leaves focus where the pointer put it.',
  },
  related: ['PixelSelect', 'PixelMenubar', 'PixelNavigationMenu', 'PixelTooltip'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
