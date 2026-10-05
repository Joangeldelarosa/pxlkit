import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelSplitButton } from '../actions';
import {
  Default,
  Tones,
  Surfaces,
  Disabled,
  WithCallbacks,
} from './PixelSplitButton.examples';

export default defineManifest({
  name: 'PixelSplitButton',
  category: 'actions',
  since: '1.0.0',
  status: 'stable',
  description:
    'Composite button pairing a primary action with a chevron-triggered dropdown menu for related secondary actions.',
  highlights: [
    'Primary click handler plus a menu of alternate actions in a single control',
    'Inherits tone + surface theming from the design system',
    'Its menu closes on an outside press, Escape or Tab',
    'aria-haspopup="menu" + aria-expanded on the chevron trigger',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'tones', label: 'Tones', Component: Tones },
    { id: 'surfaces', label: 'Surfaces', Component: Surfaces },
    { id: 'disabled', label: 'Disabled', Component: Disabled },
    { id: 'with-callbacks', label: 'With Callbacks', Component: WithCallbacks },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: ['menu', 'button'],
    keyboard: [
      { key: 'Enter / Space', does: 'Run the primary action (`onPrimary`).', when: 'primary button focused' },
      { key: 'Enter / Space', does: 'Open the menu and move focus into it; close it when it is open.', when: 'chevron focused' },
      { key: 'ArrowDown', does: 'Open the menu with focus in it, highlighting the first option.', when: 'chevron focused' },
      { key: 'ArrowUp', does: 'Open the menu with focus in it, highlighting the last option.', when: 'chevron focused' },
      { key: 'ArrowDown', does: 'Highlight the next option; stops at the last.', when: 'menu open' },
      { key: 'ArrowUp', does: 'Highlight the previous option; stops at the first.', when: 'menu open' },
      { key: 'Home', does: 'Highlight the first option.', when: 'menu open' },
      { key: 'End', does: 'Highlight the last option.', when: 'menu open' },
      { key: 'Enter / Space', does: 'Choose the highlighted option (`onSelect`), close the menu and return focus to the chevron.', when: 'menu open' },
      { key: 'Escape', does: 'Close the menu and return focus to the chevron.', when: 'menu open' },
      { key: 'Tab', does: 'Close the menu and move focus on from the chevron.', when: 'menu open' },
      { key: 'Shift+Tab', does: 'Close the menu and move focus back from the chevron to the primary button.', when: 'menu open' },
      { key: 'a-z / 0-9', does: 'Typeahead — highlight the first option whose label starts with the typed prefix.', when: 'menu open' },
    ],
    notes:
      'Follows the WAI-ARIA menu button pattern, as PixelDropdown does. The chevron is a button of its own, named "More options", with `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` wired to the menu while it is open. The menu (`role="menu"`, named by the chevron through `aria-labelledby`) takes focus as it opens (`tabindex="-1"`) and points `aria-activedescendant` at the highlighted option, so assistive technology follows the arrows, Home/End and typeahead; its `role="menuitem"` options are not tab stops. Escape, Tab and choosing an option return focus to the chevron; a press outside closes the menu and leaves focus where the pointer put it. The frame clips both halves, so each shows keyboard focus inside its own edge.',
  },
  related: ['PixelButton', 'PixelDropdown', 'PixelIconButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
