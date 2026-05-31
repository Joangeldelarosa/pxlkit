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
    'Closes on outside click via useClickOutside',
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
    patterns: ['menu'],
    keyboard: [
      { key: 'Enter', does: 'Triggers the primary action when focused on the primary button' },
      { key: 'Space', does: 'Activates the focused button (primary or chevron trigger)' },
      { key: 'Tab', does: 'Moves focus between primary button, chevron trigger, and menu items' },
    ],
    notes:
      'Chevron trigger exposes aria-haspopup="menu" and aria-expanded. Dropdown container uses role="menu" with role="menuitem" children. Outside click dismisses the menu.',
  },
  related: ['PixelButton', 'PixelDropdown', 'PixelIconButton'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
