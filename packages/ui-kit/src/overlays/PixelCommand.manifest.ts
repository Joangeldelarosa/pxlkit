import { defineManifest } from '../../../../scripts/build-docs/manifest-schema';
import { PixelCommand } from './PixelCommand';
import { Default, WithCustomShortcut, LinearSurface } from './PixelCommand.examples';

void PixelCommand;

export default defineManifest({
  name: 'PixelCommand',
  category: 'overlays',
  since: '1.8.0',
  status: 'stable',
  description:
    'Command palette overlay with fuzzy search, grouped items, keyboard shortcut binding, focus trap, scroll lock and Escape-to-close.',
  highlights: [
    'Configurable global shortcut (default mod+k) toggles the palette open from anywhere',
    'Grouped items with headings, icons, keywords for search, and per-item keyboard hints',
    'Full keyboard navigation: ArrowUp/Down, Home/End, Enter to select, Escape to close',
    'Surface-aware chrome (pixel vs linear) inherited from theme context',
    'Combobox + listbox a11y pattern with aria-activedescendant for assistive tech',
  ],
  examples: [
    { id: 'default', label: 'Default', Component: Default },
    { id: 'with-custom-shortcut', label: 'Custom shortcut', Component: WithCustomShortcut },
    { id: 'linear-surface', label: 'Linear surface', Component: LinearSurface },
  ],
  props: 'auto',
  a11y: {
    wcag: '2.1 AA',
    patterns: [
      'role="dialog" with aria-modal="true" for the palette container',
      'role="combobox" on the input with aria-expanded and aria-controls',
      'role="listbox" on the results list with role="option" items',
      'aria-activedescendant points at the highlighted option for screen readers',
      'Focus trap inside the panel and scroll lock on body while open',
    ],
    keyboard: [
      { key: 'ArrowDown', does: 'Moves highlight to the next item (wraps)' },
      { key: 'ArrowUp', does: 'Moves highlight to the previous item (wraps)' },
      { key: 'Home', does: 'Jumps highlight to the first item' },
      { key: 'End', does: 'Jumps highlight to the last item' },
      { key: 'Enter', does: 'Invokes onSelect on the highlighted item' },
      { key: 'Escape', does: 'Closes the palette', when: 'palette is open' },
      { key: 'mod+k', does: 'Toggles the palette open/closed (configurable via the shortcut prop)' },
    ],
    notes:
      'Items without matching results render an emptyMessage region instead of the listbox; aria-expanded and aria-controls track whether the listbox is currently mounted.',
  },
  related: ['PixelDropdown', 'PixelModal', 'PixelPopover'],
  apiStability: 'stable',
  ssrSafe: true,
  treeShakable: true,
});
